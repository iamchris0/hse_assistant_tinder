import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import StudentDetailsModal from './StudentDetailsModal';
import { Star, GraduationCap, Book, Send, CreditCard, CalendarDays } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';

interface Student {
  id: number;
  discipline: string;
  // prog_faculty: string;
  program: string;
  groups_count: number;
  assistance_format: string;
  start_date: Date | null;
  end_date: Date | null;
  first_name: string;
  last_name: string;
  citizenship: string;
  birthday: string;
  telegram: string;
  email: string;
  phone: string;
  faculty: string;
  edu_program: string;
  year: number;
  debts: string;
  edu_rating: string;
  digitalliteracyscore?: string;
  pythonscore?: string;
  dataanalysisscore?: string;
  primary_discipline: string;
  primary_group_size: number;
  secondary_discipline: string;
  secondary_group_size: number;
  digital_literacy_answers?: string[];
  python_programming_answers?: string[];
  data_analysis_answers?: string[];
  machine_learning_answers?: string[];
  motivation_text: string;
  achievements: string;
  experience: string;
  teacher_email: string;
  booking_id: number;
  program_count: number;
  total_groups: number;
  program_groups: number;
  booked_programs: Array<{
    program: string;
    groups: number;
  }>;
}

const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

const DISCIPLINES = [
  { value: 'digital_literacy', label: 'Цифровая грамотность' },
  { value: 'python_programming', label: 'Программирование на Python' },
  { value: 'data_analysis', label: 'Анализ данных' },
  { value: 'machine_learning', label: 'Машинное обучение' }
];

const Teach_Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    program: '',
    discipline: ''
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'teacher') {
      fetchBookedStudents();
      fetchPrograms();
    }
  }, [user]);

  useEffect(() => {
    filterStudents();
  }, [filters, students]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchPrograms = async () => {
    try {
      const response = await fetch(`/api/programs?userId=${user?.id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при получении программ');
      }
      const data = await response.json();
      setPrograms(data.programs);
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  const fetchBookedStudents = async () => {
    try {
      const response = await fetch(`/api/teachers/${user?.id}/students`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при получении студентов');
      }
      const data = await response.json();
      setStudents(data.students);
      setFilteredStudents(data.students);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(student => 
        student.first_name.toLowerCase().includes(searchLower) ||
        student.last_name.toLowerCase().includes(searchLower)
      );
    }

    if (filters.program) {
      filtered = filtered.filter(student => student.program === filters.program);
    }

    if (filters.discipline) {
      filtered = filtered.filter(student => student.discipline === filters.discipline);
    }

    setFilteredStudents(filtered);
  };

  const handleRemoveStudent = async () => {
    if (!selectedStudent) return;
    try {
      const response = await fetch(`/api/bookings/${selectedStudent.booking_id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Ошибка при удалении бронирования');
      }
      setStudents(students.filter(s => s.booking_id !== selectedStudent.booking_id));
      setFilteredStudents(filteredStudents.filter(s => s.booking_id !== selectedStudent.booking_id));
      setSuccessMessage('Студент успешно удален');
      setIsRemoveConfirmOpen(false);
      setSelectedStudent(null);
    } catch (error: any) {
      setErrorMessage(error.message || 'Не удалось удалить бронирование');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <AnimatePresence>
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
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50"
          >
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <Header />
      
      <main className="max-w-screen-2xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-6 px-4 sm:px-0">
            Мои ассистенты
          </h1>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 pl-2">
                Поиск по ФИО
              </label>
              <input
                type="text"
                placeholder="Введите фамилию студента..."
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-2 pr-2 py-0.5"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 pl-2">ОП дисциплины</label>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-2 py-1"
                value={filters.program}
                onChange={(e) => setFilters(prev => ({ ...prev, program: e.target.value }))}
              >
                <option value="">-</option>
                {programs.length > 0 && programs.every(f => f) ? (
                  programs.map((program, index) => (
                    <option key={`${program}-${index}`} value={program}>
                      {program}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Нет доступных программ</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 pl-2">Дисциплина</label>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-2 py-1"
                value={filters.discipline}
                onChange={(e) => setFilters(prev => ({ ...prev, discipline: e.target.value }))}
              >
                <option value="">-</option>
                {DISCIPLINES.map(discipline => (
                  <option key={discipline.value} value={discipline.value}>
                    {discipline.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg shadow">
              <div className="text-gray-400 mb-2">
                <Book className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-lg font-medium text-gray-900">Ассистенты не найдены</p>
              {/* <p className="text-gray-500">
                Попробуйте изменить параметры поиска или выберите себе ассистента.
              </p> */}
            </div>
          ) : (
              <motion.div 
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {filteredStudents.map((student) => (
                  <motion.div
                    key={student.booking_id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300 flex flex-col min-h-full"
                  >
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-4">
                      <h4 className="text-l font-bold text-gray-900">
                          {student.first_name} {student.last_name}
                        </h4>
                        <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                          <Star className="h-5 w-5 text-yellow-400 fill-current" />
                          <span className="ml-1 font-medium text-sm" style={{ color: '#10b981' }}>
                            {student.edu_rating === null ? '-' : student.edu_rating}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-6">
                        
                        <p className="flex items-center text-sm text-blue-500">
                          <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center mr-2">
                            <Send className="h-4 w-4" />
                          </span>
                          <a href={`https://t.me/${student.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                            {student.telegram}
                          </a>
                        </p>

                        <p className="flex items-center text-sm text-gray-500">
                          <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center mr-2">
                            <GraduationCap className="h-4 w-4" />
                          </span>
                          {student.program}
                        </p>

                        <p className="flex items-center text-sm text-gray-500">
                          <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center mr-2">
                            <Book className="h-4 w-4" />
                          </span>
                          {DISCIPLINES.find(d => d.value === student.discipline)?.label}, {student.groups_count} {student.groups_count === 1 ? 'группа' : 'группы'}
                        </p>
                        
                        <p className="flex items-center text-sm text-gray-500">
                          <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center mr-2">
                            <CalendarDays className="h-4 w-4" />
                          </span>
                          {student.start_date ? formatDate(new Date(student.start_date)) : '-'} - {student.end_date ? formatDate(new Date(student.end_date)) : '-'}
                        </p>

                        <p className="flex items-center text-sm text-gray-500">
                          <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center mr-2">
                            <CreditCard className="h-4 w-4" />
                          </span>
                          {student.assistance_format === 'money' ? 'Оплата' : 'Кредиты'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-auto">
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setIsDetailsOpen(true);
                          }}
                          className="flex justify-center items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          Подробнее
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setIsRemoveConfirmOpen(true);
                          }}
                          className="flex justify-center items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
        </div>
      </main>

      {/* Details Modal */}
      <StudentDetailsModal
        student={selectedStudent as Student}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onClick={() => {
          setSelectedStudent(selectedStudent); // Ensure the student is set
          setIsRemoveConfirmOpen(true); // Open the confirmation dialog
        }}
        pageType="dashboard"
      />

      {/* Remove Confirmation Modal */}
      <AnimatePresence>
        {isRemoveConfirmOpen && (
          <Dialog
            open={isRemoveConfirmOpen}
            onClose={() => setIsRemoveConfirmOpen(false)}
            className="fixed inset-0 z-10 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-30"
            />
            <div className="flex items-center justify-center min-h-screen px-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative bg-white rounded-lg max-w-2xl w-full mx-auto p-5"
              >
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Вы уверены, что хотите отказаться от выбранного ассистента?
                  </h3>
                  
                  <div className="mt-6 flex justify-center space-x-4">
                    <button
                      onClick={() => setIsRemoveConfirmOpen(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={handleRemoveStudent}
                      className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Подтвердить
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Teach_Dashboard;