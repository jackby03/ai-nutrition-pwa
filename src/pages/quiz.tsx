import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import TruthOrDare from '../components/TruthOrDare';
import Navbar from '../components/Navbar';

const QuizPage = () => {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'loading') return;

        if (!session) {
            router.push('/auth/login');
        }
    }, [session, status, router]);

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div>
            <Navbar />
            <TruthOrDare />
        </div>
    );
};

export default QuizPage;
