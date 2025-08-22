export async function GET(request: Request) {
  try {
    // Check if all required environment variables are present
    const requiredVars = [
      'GOOGLE_SHEETS_PROJECT_ID',
      'GOOGLE_SHEETS_PRIVATE_KEY_ID', 
      'GOOGLE_SHEETS_PRIVATE_KEY',
      'GOOGLE_SHEETS_CLIENT_EMAIL',
      'GOOGLE_SHEETS_CLIENT_ID',
      'LIVE_SHEET_ID'
    ];

    const envStatus: { [key: string]: any } = {};
    const missingVars: string[] = [];

    for (const varName of requiredVars) {
      const value = process.env[varName];
      if (!value) {
        missingVars.push(varName);
        envStatus[varName] = { status: 'MISSING', value: null };
      } else if (value.includes('your-') || value.includes('placeholder')) {
        missingVars.push(varName);
        envStatus[varName] = { status: 'PLACEHOLDER', value: value.substring(0, 20) + '...' };
      } else {
        envStatus[varName] = { 
          status: 'PRESENT', 
          value: varName === 'GOOGLE_SHEETS_PRIVATE_KEY' 
            ? `${value.substring(0, 30)}...${value.substring(value.length - 10)}` 
            : value.substring(0, 20) + '...'
        };
      }
    }

    // Test Google Sheets API connection
    let connectionTest: any = null;
    let sheetTest: any = null;

    try {
      const { google } = require('googleapis');
      
      // Configure service account
      const credentials = {
        type: 'service_account',
        project_id: process.env.GOOGLE_SHEETS_PROJECT_ID,
        private_key_id: process.env.GOOGLE_SHEETS_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_SHEETS_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.GOOGLE_SHEETS_CLIENT_EMAIL || '')}`
      };

      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
      });

      const sheets = google.sheets({ version: 'v4', auth });

      // Test basic API connection
      connectionTest = { status: 'SUCCESS', message: 'Google Sheets API connection established' };

      // Test specific sheet access
      if (process.env.LIVE_SHEET_ID) {
        try {
          const response = await sheets.spreadsheets.get({
            spreadsheetId: process.env.LIVE_SHEET_ID,
          });

          sheetTest = {
            status: 'SUCCESS',
            sheetTitle: response.data.properties?.title || 'Unknown',
            sheetId: process.env.LIVE_SHEET_ID,
            sheets: response.data.sheets?.map(sheet => sheet.properties?.title) || []
          };

          // Try to read first few rows
          try {
            const firstSheet = response.data.sheets?.[0];
            const sheetName = firstSheet?.properties?.title || 'Sheet1';
            
            const dataResponse = await sheets.spreadsheets.values.get({
              spreadsheetId: process.env.LIVE_SHEET_ID,
              range: `${sheetName}!A1:U10`,
              majorDimension: 'ROWS',
              valueRenderOption: 'UNFORMATTED_VALUE'
            });

            sheetTest.sampleData = {
              rowCount: dataResponse.data.values?.length || 0,
              columnCount: dataResponse.data.values?.[0]?.length || 0,
              headers: dataResponse.data.values?.[0] || [],
              firstDataRow: dataResponse.data.values?.[1] || []
            };

          } catch (dataError: any) {
            sheetTest.dataError = dataError.message;
          }

        } catch (sheetError: any) {
          sheetTest = {
            status: 'ERROR',
            error: sheetError.message,
            code: sheetError.code
          };
        }
      }

    } catch (apiError: any) {
      connectionTest = {
        status: 'ERROR',
        error: apiError.message
      };
    }

    // Return diagnostic information
    return Response.json({
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      environmentVariables: {
        status: missingVars.length === 0 ? 'ALL_PRESENT' : 'MISSING_VARS',
        missing: missingVars,
        details: envStatus
      },
      googleSheetsConnection: connectionTest,
      sheetAccess: sheetTest,
      recommendations: generateRecommendations(missingVars, connectionTest, sheetTest)
    });

  } catch (error) {
    console.error('Sheet diagnostic error:', error);
    return Response.json({
      error: 'Diagnostic failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

function generateRecommendations(missingVars: string[], connectionTest: any, sheetTest: any): string[] {
  const recommendations: string[] = [];

  if (missingVars.length > 0) {
    recommendations.push(`Set missing environment variables: ${missingVars.join(', ')}`);
  }

  if (connectionTest?.status === 'ERROR') {
    if (connectionTest.error.includes('private_key')) {
      recommendations.push('Check GOOGLE_SHEETS_PRIVATE_KEY format - ensure \\n characters are properly formatted');
    }
    if (connectionTest.error.includes('client_email')) {
      recommendations.push('Verify GOOGLE_SHEETS_CLIENT_EMAIL is correct service account email');
    }
    if (connectionTest.error.includes('project_id')) {
      recommendations.push('Check GOOGLE_SHEETS_PROJECT_ID matches your Google Cloud project');
    }
  }

  if (sheetTest?.status === 'ERROR') {
    if (sheetTest.error.includes('Unable to parse range') || sheetTest.code === 400) {
      recommendations.push('Sheet ID might be incorrect or sheet is not accessible');
    }
    if (sheetTest.error.includes('403') || sheetTest.code === 403) {
      recommendations.push('Service account does not have access to the sheet - share the sheet with the service account email');
    }
    if (sheetTest.error.includes('404') || sheetTest.code === 404) {
      recommendations.push('Sheet not found - check LIVE_SHEET_ID is correct');
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('All checks passed! Google Sheets integration is working correctly.');
  }

  return recommendations;
}
