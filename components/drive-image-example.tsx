import Image from "next/image";
import { getDriveDirectLink } from "@/lib/drive";

export default function DriveImageExample() {
  const driveLink =
    "https://drive.google.com/file/d/1HqMAyW2445AnZjY7fvXPR4yozQFBONDK/view?usp=sharing";

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">Google Drive Image</h2>
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Original URL:</p>
        <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">{driveLink}</p>
      </div>
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Converted URL:</p>
        <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">{getDriveDirectLink(driveLink)}</p>
      </div>
      <Image
        src={getDriveDirectLink(driveLink)}
        alt="From Google Drive"
        width={400}
        height={300}
        unoptimized={true}
      />
    </div>
  );
}
