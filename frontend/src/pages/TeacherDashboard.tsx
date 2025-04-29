import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import StudentDetailsModal from './StudentDetailsModal';
import { Star, GraduationCap, Book, Send, CreditCard, CalendarDays } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { motion } from 'framer-motion';

interface Student {
  id: number;
  discipline: string;
  prog_faculty: string;
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
}

const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

const DISCIPLINES = [
  { value: 'data_analysis', label: 'Анализ данных' },
  { value: 'python_programming', label: 'Python программирование' },
  { value: 'machine_learning', label: 'Машинное обучение' },
  { value: 'digital_literacy', label: 'Цифровая грамотность' }
];

const Teach_Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [faculties, setFaculties] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    faculty: '',
    discipline: ''
  });

  useEffect(() => {
    if (user?.role === 'teacher') {
      fetchBookedStudents();
      fetchFaculties();
    }
  }, [user]);

  useEffect(() => {
    filterStudents();
  }, [filters, students]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const fetchFaculties = async () => {
    try {
      const response = await fetch(`/api/faculties?userId=${user?.id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при получении факультетов');
      }
      const data = await response.json();
      setFaculties(data.faculties);
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

    if (filters.faculty) {
      filtered = filtered.filter(student => student.faculty === filters.faculty);
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
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при удалении студента');
      }
      setStudents(students.filter(s => s.id !== selectedStudent.id));
      setFilteredStudents(filteredStudents.filter(s => s.id !== selectedStudent.id));
      setIsRemoveConfirmOpen(false);
      setSelectedStudent(null);
    } catch (error: any) {
      setErrorMessage(error.message);
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
      
      <main className="max-w-screen-2xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-6 px-4 sm:px-0">
            Мои группы
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
              <label className="block text-sm font-medium text-gray-700 mb-1 pl-2">Факультет</label>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-2 py-1"
                value={filters.faculty}
                onChange={(e) => setFilters(prev => ({ ...prev, faculty: e.target.value }))}
              >
                <option value="">-</option>
                {faculties.length > 0 && faculties.every(f => f) ? (
                  faculties.map((faculty, index) => (
                    <option key={`${faculty}-${index}`} value={faculty}>
                      {faculty}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No faculties available</option>
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
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="text-gray-400 mb-2">
                <Book className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Студенты не найдены или не выбраны</h3>
              <p className="text-gray-500">
                Попробуйте изменить фильтры поиска, или назначьте себе студента.
              </p>
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
                        <h3 className="text-lg font-medium text-gray-900">
                          {student.first_name} {student.last_name}
                        </h3>
                        <div className="flex items-center">
                          <Star className="h-5 w-5 text-yellow-400 fill-current" />
                          <span className="ml-1" style={{ color: '#29cca3' }}>
                            {student.edu_rating === null ? '-' : student.edu_rating}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-6">
                        
                        <p className="flex items-center text-sm text-blue-500">
                          <Send className="h-4 w-4 mr-2" />
                          <a href={`https://t.me/${student.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                            {student.telegram}
                          </a>
                        </p>

                        <p className="flex items-center text-sm text-gray-500">
                          <GraduationCap className="h-4 w-4 mr-2" />
                          {student.prog_faculty} ({student.program})
                        </p>

                        <p className="flex items-center text-sm text-gray-500">
                          <Book className="h-4 w-4 mr-2" />
                          {DISCIPLINES.find(d => d.value === student.discipline)?.label}, {student.groups_count} {student.groups_count === 1 ? 'группа' : 'группы'}
                        </p>
                        
                        <p className="flex items-center text-sm text-gray-500">
                          <CalendarDays className="h-4 w-4 mr-2" />
                          {student.start_date ? formatDate(new Date(student.start_date)) : '-'} - {student.end_date ? formatDate(new Date(student.end_date)) : '-'}
                        </p>

                        <p className="flex items-center text-sm text-gray-500">
                          <CreditCard className="h-4 w-4 mr-2" />
                          {student.assistance_format === 'money' ? 'Материальная оплата' : 'Кредиты'}
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
      <Dialog
        open={isRemoveConfirmOpen}
        onClose={() => setIsRemoveConfirmOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-30" />

          <div className="relative bg-white rounded-lg max-w-2xl w-full mx-auto p-5">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Вы уверены, что хотите отозвать выбранного студента?
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
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Teach_Dashboard;