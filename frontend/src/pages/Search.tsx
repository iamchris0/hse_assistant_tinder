import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import StudentDetailsModal from './StudentDetailsModal';
import { Loader2, Search as SearchIcon, Star, GraduationCap, Book, X, Send, Mail, Check, CheckCheck } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { motion } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  telegram: string;
  birthday: string;
  citizenship: string;
  phone: string;
  faculty: string;
  edu_program: string;
  year: number;
  debts: string;
  edu_rating: string | null;
  digitalliteracyscore?: string;
  pythonscore?: string;
  dataanalysisscore?: string;
  primary_discipline: string;
  primary_group_size: number;
  secondary_discipline: string;
  secondary_group_size: number;
  digital_literacy_answers?: string[];
  data_analysis_answers?: string[];
  python_programming_answers?: string[];
  machine_learning_answers?: string[];
  motivation_text: string;
  achievements: string;
  experience: string;
  teacher_email: string;
}

interface BookingFormData {
  discipline: string;
  groupsCount: number;
  assistanceFormat: 'money' | 'credits';
  startDate: Date | null;
  endDate: Date | null;
  prog_faculty: string;
  program: string;
}

const DISCIPLINES = [
  { value: 'data_analysis', label: 'Анализ данных' },
  { value: 'python_programming', label: 'Python программирование' },
  { value: 'machine_learning', label: 'Машинное обучение' },
  { value: 'digital_literacy', label: 'Цифровая грамотность' }
];

const PROGRAMS = [
  'Управление в креативных индустриях', 'Международные отношения', 'Химия',
  'ИЯиМКК (РУС)', 'ИЯиМКК (АНГЛ)',
  'Математика', 'Социология', 'Стратегия и продюсирование в коммуникациях',
  'Реклама и связи с общественностью', 'Кинопроизводство, Актеры',
  'Востоковедение', 'История', 'История искусств', 'Филология', 'Культурология',
  'Философия', 'Дизайн, Мода, Современное искусство', 'Античность', 'Библеистика/Израиль',
  'Язык и литература Индии', 'Язык и литература Ирана',
  'ФИКЛ', 'Дизайн НН', 'Дизайн Спб', 'Кёнхи', 'МОГИ',
  'Мировая экономика', 'Политология', 'Экономика', 'Физика', 'Цифровой юрист', 'Право',
  'Бизнес-информатика','Язык, словесность и культура Кореи',
  'Египтология', 'Языки и литература ЮВ Азии'
]
.sort();

const FACULTY = [
  'ФЭН', 'ФКН', 'ФСН', 'Право', 'ВШБ'
]
.sort();

const Search: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [faculties, setFaculties] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    faculty: '',
    discipline: ''
  });
  const [bookingData, setBookingData] = useState<BookingFormData>({
    discipline: '',
    groupsCount: 1,
    assistanceFormat: 'money',
    startDate: null,
    endDate: null,
    prog_faculty: '',
    program: ''
  });

  useEffect(() => {
    fetchFaculties();
    fetchStudents();
  }, [filters]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [errorMessage]);

  const fetchFaculties = async () => {
    try {
      const response = await fetch(`/api/faculties`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при получении факультетов');
      }
      const data = await response.json();
      setFaculties(data.faculties);
    } catch (error: any) {
      setErrorMessage(error.message);
      console.error('Error fetching faculties:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`/api/students?${queryParams}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при получении студентов');
      }
      const data = await response.json();
      setStudents(data.students);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!bookingData.discipline) {
      setErrorMessage('Укажите дисциплину');
      return;
    }

    if (!bookingData.program) {
      setErrorMessage('Укажите образовательную программу');
      return;
    }
  
    if (!bookingData.startDate || !bookingData.endDate) {
      setErrorMessage('Укажите даты начала и окончания');
      return;
    }
  
    if (isNaN(bookingData.startDate.getTime()) || isNaN(bookingData.endDate.getTime())) {
      setErrorMessage('Неверный формат даты');
      return;
    }
  
    // Normalize dates to remove time components
    const start = new Date(bookingData.startDate.setHours(0, 0, 0, 0));
    const end = new Date(bookingData.endDate.setHours(0, 0, 0, 0));
  
    if (end.getTime() < start.getTime()) {
      setErrorMessage('Дата окончания не может быть раньше даты начала');
      return;
    }
  
    try {
      const response = await fetch(`/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: selectedStudent?.id,
          teacherId: user?.id,
          discipline: bookingData.discipline,
          groupsCount: bookingData.groupsCount,
          assistanceFormat: bookingData.assistanceFormat,
          startDate: bookingData.startDate.toISOString().split('T')[0],
          endDate: bookingData.endDate.toISOString().split('T')[0],
          program: bookingData.program,
          prog_faculty: bookingData.prog_faculty
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при бронировании ассистента');
      }
      setBookingSuccess(true);
      setTimeout(() => {
        setIsBookingOpen(false);
        setBookingSuccess(false);
        setBookingData({
          discipline: '',
          groupsCount: 1,
          assistanceFormat: 'money',
          startDate: null,
          endDate: null,
          prog_faculty: '',
          program: ''
        });
      }, 2200);
    } catch (error: any) {
      setErrorMessage(error.message || 'Ошибка при бронировании ассистента');
      console.log('Error set from API:', error.message);
      console.error('Ошибка при бронировании ассистента:', error);
    }
  };

  const openBookingModal = (student: Student) => {
    setSelectedStudent(student);
    setIsBookingOpen(true);
    setBookingData({
      discipline: '',
      groupsCount: 1,
      assistanceFormat: 'money',
      startDate: null,
      endDate: null,
      prog_faculty: '',
      program: ''
    });
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
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {errorMessage && (
        <div
          className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-[1000]"
        >
          {errorMessage}
        </div>
      )}
      <main className="max-w-screen-2xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
            <SearchIcon className="h-6 w-6" />
            Поиск ассистента
          </h1>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                      {/* grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 */}
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
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-1 py-1"
                value={filters.faculty}
                onChange={(e) => setFilters(prev => ({ ...prev, faculty: e.target.value }))}
              >
                <option value="">-</option>
                {faculties.length > 0 ? faculties.map(faculty => (
                  <option key={faculty} value={faculty}>
                    {faculty}
                  </option>
                )) : <option value="" disabled>No faculties available</option>}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 pl-2">Дисциплина</label>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-1 py-1"
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

          {students.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="text-gray-400 mb-2">
                <Book className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Студенты не найдены</h3>
              <p className="text-gray-500">
                Попробуйте изменить фильтры поиска, чтобы найти больше студентов.
              </p>
            </div>
          ) : (
            <motion.div 
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            >
              {students.map((student) => (
                <motion.div
                key={student.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300 flex flex-col min-h-full"
              >
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {student.first_name} {student.last_name}
                    </h3>
                    <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 font-medium" style={{
                        color: '#10b981'
                      }}>
                        {student.edu_rating === null ? '-' : student.edu_rating}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center bg-green-50 rounded-lg p-2">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm text-gray-700">
                        {DISCIPLINES.find(d => d.value === student.primary_discipline)?.label}
                        {student.primary_group_size && 
                          <span className="ml-1 text-gray-500">
                            ({student.primary_group_size} {student.primary_group_size === 1 ? 'группа' : 'группы'})
                          </span>
                        }
                      </span>
                    </div>
                    <div className="flex items-center bg-blue-50 rounded-lg p-2">
                      <CheckCheck className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="text-sm text-gray-700">
                        {student.secondary_discipline ? 
                          <span>
                            {DISCIPLINES.find(d => d.value === student.secondary_discipline)?.label}
                            {student.secondary_group_size && 
                              <span className="ml-1 text-gray-500">
                                ({student.secondary_group_size} {student.secondary_group_size === 1 ? 'группа' : 'группы'})
                              </span>
                            }
                          </span> : 
                          'Приоритета нет'}
                      </span>
                    </div>
                  </div>
              
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-gray-600">
                      <GraduationCap className="h-4 w-4 mr-2 text-blue-500" />
                      <span>{student.faculty}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <div className="flex flex-col justify-center items-center">
                        <Book className="h-4 w-4 mr-2 text-blue-500" />
                      </div>
                      <div className="flex flex-col">
                        <span>{student.edu_program} ({student.year} курс)</span>
                        {/* <span></span> */}
                      </div>
                    </div>
                  </div>
              
                  <div className="space-y-3 mb-6">
                    <a 
                      href={`https://t.me/${student.telegram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      <span className="text-sm">{student.telegram}</span>
                    </a>
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      <span className="text-sm">{student.email}</span>
                    </div>
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
                      onClick={() => openBookingModal(student)}
                      className="flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Выбрать
                    </button>
                  </div>
                </div>
              </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        <StudentDetailsModal
          student={selectedStudent as Student}
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          onClick={openBookingModal}
          pageType='search'
        />

        <Dialog
          open={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          className="fixed inset-0 z-10 overflow-y-auto bg-black bg-opacity-30"
        >
          <div className="flex items-center justify-center min-h-screen px-4">
            <Dialog.Panel className="relative bg-white rounded-lg max-w-md w-full mx-auto p-6">
              {!bookingSuccess ? (
                <>
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold">Забронировать ассистента</h2>
                    <button
                      onClick={() => setIsBookingOpen(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block pl-2 text-sm font-medium text-gray-700 mb-1">
                        Укажите дисциплину <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={bookingData.discipline}
                        onChange={(e) => setBookingData({
                          ...bookingData,
                          discipline: e.target.value
                        })}
                        className="pl-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1"
                        required
                      >
                        <option value="" disabled>-</option>
                        {DISCIPLINES.map(discipline => (
                          <option key={discipline.value} value={discipline.value}>
                            {discipline.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block pl-2 text-sm font-medium text-gray-700 mb-1">
                        Укажите факультет программы <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        list="prog_faculty"
                        value={bookingData.prog_faculty}
                        onChange={(e) => setBookingData({
                          ...bookingData,
                          prog_faculty: e.target.value
                        })}
                        placeholder="Введите факультет..."
                        className="pl-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1"
                        required
                      />
                      <datalist id="prog_faculty">
                        {FACULTY.map(prog_faculty => (
                          <option key={prog_faculty} value={prog_faculty} />
                        ))}
                      </datalist>
                    </div>

                    <div>
                      <label className="block pl-2 text-sm font-medium text-gray-700 mb-1">
                        Укажите образовательную программу <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        list="programs"
                        value={bookingData.program}
                        onChange={(e) => setBookingData({
                          ...bookingData,
                          program: e.target.value
                        })}
                        placeholder="Введите программу..."
                        className="pl-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1"
                        required
                      />
                      <datalist id="programs">
                        {PROGRAMS.map(program => (
                          <option key={program} value={program} />
                        ))}
                      </datalist>
                    </div>

                    <div className="flex flex-row space-x-4">
                      <div className="flex-1">
                        <label className="block pl-2 text-sm font-medium text-gray-700 mb-1">
                          Укажите дату начала <span className="text-red-500">*</span>
                        </label>
                        <DatePicker
                          selected={bookingData.startDate}
                          onChange={(date: Date | null) => setBookingData({
                            ...bookingData,
                            startDate: date
                          })}
                          dateFormat="dd / MM / yyyy"
                          className="pl-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1"
                          placeholderText="Выберите дату"
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block pl-2 text-sm font-medium text-gray-700 mb-1">
                          Укажите дату окончания <span className="text-red-500">*</span>
                        </label>
                        <DatePicker
                          selected={bookingData.endDate}
                          onChange={(date: Date | null) => setBookingData({
                            ...bookingData,
                            endDate: date
                          })}
                          dateFormat="dd / MM / yyyy"
                          className="pl-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-50 py-1"
                          placeholderText="Выберите дату"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block pl-2 text-sm font-medium text-gray-700 mb-2">
                        Укажите кол-во групп
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        {[1, 2].map(num => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setBookingData({
                              ...bookingData,
                              groupsCount: num
                            })}
                            className={`py-2 px-4 rounded-md text-sm font-medium ${
                              bookingData.groupsCount === num
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {num} {num === 1 ? 'группа' : 'группы'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block pl-2 text-sm font-medium text-gray-700 mb-2">
                        Укажите формат ассистирования
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { value: 'money', label: 'Деньги' },
                          { value: 'credits', label: 'Кредиты' }
                        ].map(option => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setBookingData({
                              ...bookingData,
                              assistanceFormat: option.value as 'money' | 'credits'
                            })}
                            className={`py-2 px-4 rounded-md text-sm font-medium ${
                              bookingData.assistanceFormat === option.value
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleBooking}
                      disabled={!bookingData.discipline || !bookingData.program || !bookingData.startDate || !bookingData.endDate}
                      className="w-full py-3 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Подтвердить выбор
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="mt-3 text-lg font-medium text-gray-900">It's a match 🎉</h3>
                  <p className="mt-2 text-lg text-gray-500">
                    Ассистент успешно забронирован!
                  </p>
                </div>
              )}
            </Dialog.Panel>
          </div>
        </Dialog>
      </main>
    </div>
  );
};

export default Search;