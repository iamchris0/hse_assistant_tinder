import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import StudentDetailsModal from './StudentDetailsModal';
import { Loader2, Search as SearchIcon, Star, GraduationCap, Book, X, Send, Mail, Check, CheckCheck } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
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
  booked_programs: Array<{
    program: string;
    groups: number;
  }>;
}

interface BookingFormData {
  discipline: string;
  groupsCount: number;
  assistanceFormat: 'money' | 'credits';
  startDate: Date | null;
  endDate: Date | null;
  program: string;
  booked_programs?: Array<{
    program: string;
    groups: number;
  }> | [];
}

const DISCIPLINES = [
  { value: 'data_analysis', label: 'Анализ данных' },
  { value: 'python_programming', label: 'Python программирование' },
  { value: 'machine_learning', label: 'Машинное обучение' },
  { value: 'digital_literacy', label: 'Цифровая грамотность' }
];

const PROGRAMS = [
  'Актер', 'Античность', 'Арабистика: язык, словесность, культура',
  'Ассириология: языки и история древней Месопотамии', 'Востоковедение',
  'Глобальные цифровые коммуникации', 'Египтология', 'Журналистика',
  'Иностранные языки и межкультурная бизнес-коммуникация',
  'Иностранные языки и межкультурная коммуникация',
  'Иностранные языки и межкультурная коммуникация в бизнесе',
  'История', 'История искусств', 'Кинопроизводство', 'Культурология',
  'Медиакоммуникации', 'Право', 'Реклама и связи с общественностью',
  'Стратегия и продюсирование в коммуникациях', 'Филология', 'Философия',
  'Цифровой юрист', 'Юриспруденция', 'Юриспруденция: частное право',
  'Язык, словесность и культура Китая', 'Язык, словесность и культура Кореи',
  'Юго-Восточная Азия: языки, история, культуры',
  'Япония: язык, история, литература, культура',
  'Языки и литература Юго-Восточной Азии', 'Дизайн', 'Мода',
  'Современное искусство', 'География глобальных изменений и геоинформационные технологии',
  'Аналитика в экономике', 'Городское планирование',
  'Государственное и муниципальное управление',
  'Инфокоммуникационные технологии и системы связи',
  'Информатика и вычислительная техника',
  'Клеточная и молекулярная биотехнология', 'Когнитивная нейробиология',
  'Компьютерная безопасность', 'Компьютерные технологии, системы и сети',
  'Логистика и управление цепями поставок', 'Маркетинг и рыночная аналитика',
  'Математика', 'Международная программа "Международные отношения и глобальные исследования"',
  'Международная программа по мировой политике', 'Международные отношения',
  'Международный бизнес', 'Международный бизнес и менеджмент',
  'Международная программа по экономике и финансам',
  'Международный бакалавриат по бизнесу и экономике',
  'Совместная программа по экономике НИУ ВШЭ и РЭШ', 'Мировая экономика',
  'Политология', 'Политология и мировая политика',
  'Программа двух дипломов НИУ ВШЭ и Университета Кёнхи "Экономика и политика в Азии"',
  'Психология', 'Совместный бакалавриат НИУ ВШЭ и ЦПМ', 'Социология',
  'Социология и социальная информатика', 'Управление бизнесом',
  'Управление и аналитика в государственном секторе',
  'Управление цепями поставок и бизнес-аналитика', 'Физика',
  'Фундаментальная и компьютерная лингвистика',
  'Фундаментальная и прикладная лингвистика', 'Химия', 'Цифровой маркетинг',
  'Экономика', 'Экономика и анализ данных', 'Экономика и статистика',
  'Экономический анализ', 'Управление в креативных индустриях',
  'Бизнес-информатика', 'Вычислительные социальные науки',
  'Дизайн и разработка информационных продуктов', 'Информационная безопасность',
  'Компьютерные науки и анализ данных', 'Прикладная математика',
  'Прикладная математика и информатика', 'Прикладной анализ данных',
  'Прикладной анализ данных и искусственный интеллект', 'Программная инженерия',
  'Разработка информационных систем для бизнеса',
  'Программные системы и автоматизация процессов разработки',
  'Технологии искусственного и дополненного интеллекта',
  'Управление цифровым продуктом',
  'Цифровые инновации в управлении предприятием',
  'Цифровые платформы и логистика', 'Экономика и анализ данных'
].sort();

// Helper to format date as YYYY-MM-DD in local time
const formatDateLocal = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Search: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [allFaculties, setAllFaculties] = useState<string[]>([]);
  const [availableGroups, setAvailableGroups] = useState<number[]>([]);
  const [allPrograms, setAllPrograms] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    faculty: '',
    program: '',
    discipline: ''
  });
  const [bookingData, setBookingData] = useState<BookingFormData>({
    discipline: '',
    groupsCount: 1,
    assistanceFormat: 'money',
    startDate: null,
    endDate: null,
    program: '',
    booked_programs: [
      {
        program: '',
        groups: 0
      }
    ]
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);
  const [noGroupsAvailable, setNoGroupsAvailable] = useState(false);

  // useEffect(() => {
  //   if (errorMessage) {
  //     const timer = setTimeout(() => {
  //       setErrorMessage(null);
  //     }, 3000);
  //     return () => {
  //       clearTimeout(timer);
  //     };
  //   }
  // }, [errorMessage]);

  const fetchFaculties = async (program?: string) => {
    const url = program ? `/api/faculties?program=${encodeURIComponent(program)}` : '/api/faculties';
    const res = await fetch(url);
    const data = await res.json();
    setAllFaculties(data.faculties || []);
  };

  const fetchPrograms = async (faculty?: string) => {
    const url = faculty ? `/api/programs?faculty=${encodeURIComponent(faculty)}` : '/api/programs';
    const res = await fetch(url);
    const data = await res.json();
    console.log(data.programs);
    setAllPrograms(Array.from(new Set(data.programs || [])));
  };

  useEffect(() => {
    fetchPrograms(filters.faculty);
  }, [filters.faculty]);

  useEffect(() => {
    fetchFaculties(filters.program);
  }, [filters.program]);

  useEffect(() => {
    if (filters.program && !allPrograms.includes(filters.program)) {
      setFilters(prev => ({ ...prev, program: '' }));
    }
  }, [allPrograms]);

  useEffect(() => {
    if (filters.faculty && !allFaculties.includes(filters.faculty)) {
      setFilters(prev => ({ ...prev, faculty: '' }));
    }
  }, [allFaculties]);

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

  // Initial fetch and setup interval
  useEffect(() => {
    fetchStudents();
    
    // Set up interval for automatic refresh
    const intervalId = setInterval(() => {
      fetchStudents();
    }, 2000);

    // Cleanup interval on component unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [filters]); // Dependencies array includes filters to re-run when filters change

  const showAvailableGroups = (selectedStudent: Student, program: string) => {
    if (!selectedStudent || !program) {
      setAvailableGroups([]);
      setShowAdditionalFields(false);
      setNoGroupsAvailable(false);
      return;
    }

    const uniquePrograms = new Set(selectedStudent.booked_programs?.map(p => p.program) || []);
    
    // Check if student has reached maximum number of unique programs (2)
    if (uniquePrograms.size >= 2 && !uniquePrograms.has(program)) {
      // Find programs that have free groups (less than 2 groups)
      const programsWithFreeGroups = selectedStudent.booked_programs
        ?.filter(p => p.groups < 2)
        .map(p => p.program) || [];

      if (programsWithFreeGroups.length > 0) {
        setAvailableGroups([]);
        setShowAdditionalFields(false);
        setNoGroupsAvailable(true);
        setErrorMessage(null);
      } else {
        setAvailableGroups([]);
        setShowAdditionalFields(false);
        setNoGroupsAvailable(true);
        setErrorMessage(null);
      }
      return;
    }

    // Get the current number of groups for this program
    const currentProgram = selectedStudent.booked_programs?.find(
      (p) => p.program === program
    );

    if (currentProgram) {
      // If program exists, calculate remaining available groups
      const remainingGroups = 2 - currentProgram.groups;
      setAvailableGroups(remainingGroups > 0 ? [remainingGroups] : []);
      setShowAdditionalFields(remainingGroups > 0);
      setNoGroupsAvailable(remainingGroups === 0);
      setErrorMessage(null);
    } else {
      // If program doesn't exist, both groups are available
      setAvailableGroups([1, 2]);
      setShowAdditionalFields(true);
      setNoGroupsAvailable(false);
    }
  };

  const handleBooking = async () => {

    console.log(bookingData);
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
          startDate: formatDateLocal(bookingData.startDate),
          endDate: formatDateLocal(bookingData.endDate),
          program: bookingData.program,
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
          program: ''
        });
      }, 5000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Ошибка при бронировании ассистента');
    }
  };

  const openBookingModal = (student: Student) => {
    setSelectedStudent({
      ...student,
      booked_programs: student.booked_programs || []
    });
    setIsBookingOpen(true);
    setBookingData({
      discipline: '',
      groupsCount: 1,
      assistanceFormat: 'money',
      startDate: null,
      endDate: null,
      program: '',
      booked_programs: []
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
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-[1000]"
          >
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>
      <main className="max-w-screen-2xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
            <SearchIcon className="h-6 w-6" />
            Поиск ассистента
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 pl-2">Факультет студента</label>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-1 py-1"
                value={filters.faculty}
                onChange={(e) => setFilters(prev => ({ ...prev, faculty: e.target.value }))}
              >
                <option value="">-</option>
                {allFaculties.length > 0 ? allFaculties.map(faculty => (
                  <option key={faculty} value={faculty}>
                    {faculty}
                  </option>
                )) : <option value="" disabled>Факультеты не найдены</option>}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 pl-2">Образовательная программа</label>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-1 py-1"
                value={filters.program}
                onChange={(e) => setFilters(prev => ({ ...prev, program: e.target.value }))}
              >
                <option value="">-</option>
                {allPrograms.length > 0 ? allPrograms.map(program => (
                  <option key={program} value={program}>
                    {program}
                  </option>
                )) : <option value="" disabled>Программы не найдены</option>}
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
                Попробуйте изменить параметры поиска, чтобы найти подходящего кандидата.
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
                    <h4 className="text-l font-bold text-gray-900">
                      {student.first_name} {student.last_name}
                    </h4>
                    <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 font-medium text-sm" style={{ color: '#10b981' }}>
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

        <AnimatePresence>
          {isBookingOpen && (
            <Dialog
              open={isBookingOpen}
              onClose={() => {
                setIsBookingOpen(false);
                setShowAdditionalFields(false);
                setNoGroupsAvailable(false);
              }}
              className="fixed inset-0 z-10 overflow-y-auto bg-black bg-opacity-30"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black bg-opacity-30"
              />
              <div className="flex items-center justify-center min-h-screen px-0">
                <Dialog.Panel as="div">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className="relative bg-white rounded-lg max-w-7xl min-w-[600px] w-full p-12 mx-auto"
                  >
                    {!bookingSuccess ? (
                      <>
                        <div className="flex justify-between items-center mb-8">
                          <h2 className="text-xl font-bold">Забронировать ассистента</h2>
                          <button
                            onClick={() => {
                              setIsBookingOpen(false);
                              setShowAdditionalFields(false);
                              setNoGroupsAvailable(false);
                            }}
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
                              onChange={(e) => {
                                const newDiscipline = e.target.value;
                                setBookingData({
                                  ...bookingData,
                                  discipline: newDiscipline,
                                  program: '',
                                  groupsCount: 1
                                });
                                setShowAdditionalFields(false);
                                setNoGroupsAvailable(false);
                              }}
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
                              Укажите образовательную программу <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              list="programs"
                              value={bookingData.program}
                              onChange={(e) => {
                                const newProgram = e.target.value;
                                setBookingData({
                                  ...bookingData,
                                  program: newProgram,
                                  groupsCount: 1
                                });
                                showAvailableGroups(selectedStudent as Student, newProgram);
                              }}
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

                          <AnimatePresence>
                            {showAdditionalFields && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4"
                              >
                                <div>
                                  <label className="block pl-2 text-sm font-medium text-gray-700 mb-2">
                                    Укажите кол-во групп
                                  </label>
                                  <div className="grid grid-cols-2 gap-4 p-2">
                                    {[1, 2].map(num => {
                                      const isAvailable = availableGroups.includes(num);
                                      return (
                                        <button
                                          key={num}
                                          type="button"
                                          onClick={() => isAvailable && setBookingData({
                                            ...bookingData,
                                            groupsCount: num
                                          })}
                                          disabled={!isAvailable}
                                          className={`py-2 px-4 rounded-md text-sm font-medium ${
                                            bookingData.groupsCount === num
                                              ? 'bg-blue-600 text-white'
                                              : isAvailable
                                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                          }`}
                                        >
                                          {num} {num === 1 ? 'группа' : 'группы'}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div className="mb-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col w-full">
                                      <label className="block text-sm font-medium text-gray-700 mb-1 pl-2">
                                        Дата начала <span className="text-red-500">*</span>
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
                                    <div className="flex flex-col w-full">
                                      <label className="block text-sm font-medium text-gray-700 mb-1 pl-2">
                                        Дата окончания <span className="text-red-500">*</span>
                                      </label>
                                      <DatePicker
                                        selected={bookingData.endDate}
                                        onChange={(date: Date | null) => setBookingData({
                                          ...bookingData,
                                          endDate: date
                                        })}
                                        dateFormat="dd / MM / yyyy"
                                        className="pl-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1"
                                        placeholderText="Выберите дату"
                                        required
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <label className="block pl-2 text-sm font-medium text-gray-700 mb-2">
                                    Укажите формат ассистирования
                                  </label>
                                  <div className="grid grid-cols-2 gap-4 p-2">
                                    {[
                                      { value: 'money', label: 'Оплата' },
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
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <AnimatePresence>
                            {noGroupsAvailable && (
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="bg-red-50 border border-red-200 rounded-md p-4"
                              >
                                <p className="text-red-600 text-sm">
                                  {(() => {
                                    const uniquePrograms = new Set(selectedStudent?.booked_programs?.map(p => p.program) || []);
                                    if (uniquePrograms.size >= 2 && !uniquePrograms.has(bookingData.program)) {
                                      const programsWithFreeGroups = selectedStudent?.booked_programs
                                        ?.filter(p => p.groups < 2)
                                        .map(p => p.program) || [];
                                      
                                      if (programsWithFreeGroups.length > 0) {
                                        return `Студент не может быть забронирован на эту ОП. Вы можете забронировать его на: ${programsWithFreeGroups[0]}`;
                                      }
                                    }
                                    return "Студент уже забронирован на максимальное количество групп для данной программы";
                                  })()}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-6">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                          <Check className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="mt-3 text-lg font-medium text-gray-900">It's a match 🎉</h3>
                        <p className="mt-2 text-lg text-gray-500">
                          Вы выбрали ассистента!
                        </p>
                        <p className="mt-2 text-lg text-gray-500">
                          Не забудьте написать ему в <strong>Telegram</strong> и зафиксировать ваши договоренности.
                        </p>
                      </div>
                    )}
                  </motion.div>
                </Dialog.Panel>
              </div>
            </Dialog>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Search;