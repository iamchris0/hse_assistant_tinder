import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import { Book, Send, UsersRound, CreditCard, CalendarDays } from 'lucide-react';


interface Disciplines {
  id: number;
  teacher_first_name: string;
  teacher_last_name: string;
  discipline: string;
  groups_count: number;
  assistance_format: string;
  start_date: Date | null;
  end_date: Date | null;
}

const DISCIPLINES = [
  { value: 'data_analysis', label: 'Анализ данных' },
  { value: 'python_programming', label: 'Python программирование' },
  { value: 'machine_learning', label: 'Машинное обучение' },
  { value: 'digital_literacy', label: 'Цифровая грамотность' }
];

const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

const Stud_Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [disciplines, setDisciplines] = useState<Disciplines[]>([]);
  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);


  useEffect(() => {
    if (user?.role !== 'teacher') {
      fetchBookedDisciplines()
    }
  }, [user]);

  const fetchBookedDisciplines = async () => {
    try {
      const response = await fetch(`/api/students/${user?.id}/disciplines`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при получении дисциплин');
      }
      const data = await response.json();
      setDisciplines(data.disciplines);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50"
          >
            {errorMessage}
          </motion.div>
        )}

        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-screen-2xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-6 px-4 sm:px-0
          ">Мои группы</h1>

          <>
          {disciplines.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="text-gray-400 mb-2">
                <Book className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Вас пока не выбрали 😢</h3>
              <p className="text-gray-500">
                Ожидайте согласования бронирования от преподавателя или обратитесь к соответствующим лицам.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {disciplines.map((student) => (
                <div
                  key={student.id}
                  className="bg-white overflow-hidden shadow-lg rounded-lg"
                >
                  <div className="px-6 py-4 pb-0">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {student.teacher_first_name} {student.teacher_last_name}
                      </h3>
                    </div>

                    <div className="space-y-2 mb-6">
                      <p className="flex items-center text-sm text-blue-500">
                        <Send className="h-4 w-4 mr-2" />
                        {/* <a href={`https://t.me/${student.teacher_telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                          {student.teacher_telegram}
                        </a> */}
                        Тут будет тг
                      </p>

                      <p className="flex items-center text-sm text-gray-500">
                        <Book className="h-4 w-4 mr-2" />
                        {DISCIPLINES.find(discipline => discipline.value === student.discipline)?.label || student.discipline}
                      </p>

                      <p className="flex items-center text-sm text-gray-500">
                        <UsersRound className="h-4 w-4 mr-2" />
                        {student.groups_count} {student.groups_count === 1 ? 'группа' : 'группы'}
                      </p>

                      <p className="flex items-center text-sm text-gray-500">
                          <CalendarDays className="h-4 w-4 mr-2" />
                          {student.start_date ? formatDate(new Date(student.start_date)) : '-'} - {student.end_date ? formatDate(new Date(student.end_date)) : '-'}
                        </p>

                      <p className="flex items-center text-sm text-gray-500">
                        <CreditCard className="h-4 w-4 mr-2" />
                        {student.assistance_format === 'money' ? 'Денежная оплата' : 'Кредиты'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          </>
        </div>
      </main>
    </div>
  );
};

export default Stud_Dashboard;