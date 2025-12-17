import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { Card, CardContent } from '../components/ui';
import { RegisterForm } from '../components/auth';

export default function Register() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white mb-4">
            <Calendar className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create Account
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Start booking resources today
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <RegisterForm onSuccess={() => navigate('/')} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
