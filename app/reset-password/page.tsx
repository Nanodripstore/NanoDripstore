import ResetPasswordForm from '@/components/form/reset-password-form';
import { redirect } from 'next/navigation';

interface ResetPasswordPageProps {
  searchParams: {
    token?: string;
  };
}

const ResetPasswordPage = ({ searchParams }: ResetPasswordPageProps) => {
  const { token } = searchParams;

  if (!token) {
    redirect('/forgot-password');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <ResetPasswordForm token={token} />
    </div>
  );
};

export default ResetPasswordPage;
