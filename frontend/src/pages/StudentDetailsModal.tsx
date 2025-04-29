import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { motion } from 'framer-motion';
import {
  Globe, Cake, Send, Mail, Phone, GraduationCap, Book, Calendar, AlertCircle, Star,
  Check, CheckCheck, Target, MessageSquare, Award, Briefcase, UserCheck, X, ChevronDown, ChevronUp
} from 'lucide-react';

interface Student {
  id: number;
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
  edu_rating: string | null;
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
}

interface StudentDetailsModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onClick: (student: Student) => void;
  pageType: "dashboard" | "search";
}

const DISCIPLINE_QUESTIONS: Record<string, string[]> = {
  data_analysis: [
    "Как вы объясните студенту разницу между медианой и средним?",
    "Анализируем датасет по пиццериям. Задача найти название ресторана (Restaurant), где стоимость пиццы (Price) максимальна. Студент написал следующий код. Исправьте ошибки студента в коде (не меняя логики решения) и поясните каждую ошибку, которую допустил студент:",
  ],
  digital_literacy: [
    "Приложите ссылку на вашу попытку сдачи экзамена в разделе Случайный вариант Открытого банка НЭ: https://edu.hse.ru/mod/quiz/view.php?id=507480",
    "Выберите вопрос из вашей случайной попытки и представьте, что к вам обратился студент с просьбой его пояснить. Как вы ответите?",
    "Расскажите, на чём бы вы сфокусировались, если бы вас попросили провести консультацию по Независимому экзамену?"
  ],
  python_programming: [
    "Студент спрашивает: есть while, а есть while True — в чем разница? Как вообще в этом разобраться? Что такое break и continue? Почему у меня завис код при запуске?",
    "Студент спрашивает: как работает цикл for? С какими данными? for i in range() ... что такое i и range? Почему, если написать вместо i что-то другое, тоже будет работать? Я пытаюсь в цикле for поменять элементы списка/кортежа, но у меня ничего не изменяется, почему?",
    "Студент спрашивает: я пытаюсь в качестве ключа словаря сделать список, но программа ругается...Как мне сразу обратиться и к ключу, и к значению? Предположим, что у меня есть данные по студентам и их оценкам за тест, и я хочу в качестве ключей сделать оценки, но часть данных теряется — как это исправить? Как отсортировать словарь по значениям? А если в словаре ключ — это имя студента, а значение — список с оценками за три теста: как мне вывести фамилии студентов в зависимости от из оценки за первый тест (от большей к меньшей)?",
  ],
  machine_learning: [
    "Студент говорит, что хочет научиться рисовать красивые графики — например, при визуализации выборки. Что вы посоветуете ему почитать?"
  ]
};

const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({ student, isOpen, onClose, onClick, pageType }) => {
  if (!student) return null;

  const handleBook = () => {
    onClose();
    onClick(student);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const [sections, setSections] = useState({
    personalInfo: false,
    educationInfo: false,
    examGrades: false,
    disciplines: false,
    motivationAchievements: false,
    recommendation: false,
  });

  const toggleSection = (section: keyof typeof sections) => {
    setSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const getDisciplineAnswers = (discipline: string): string[] => {
    switch (discipline) {
      case 'digital_literacy':
        return student.digital_literacy_answers || [];
      case 'python_programming':
        return student.python_programming_answers || [];
      case 'data_analysis':
        return student.data_analysis_answers || [];
      case 'machine_learning':
        return student.machine_learning_answers || [];
      default:
        return [];
    }
  };

  const getDisciplineLabel = (discipline: string): string => {
    switch (discipline) {
      case 'digital_literacy':
        return 'Цифровая грамотность';
      case 'python_programming':
        return 'Программирование на Python';
      case 'data_analysis':
        return 'Анализ данных';
      case 'machine_learning':
        return 'Машинное обучение';
      default:
        return discipline;
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="flex inset-0 z-10 overflow-y-auto bg-black bg-opacity-30">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black bg-opacity-30"
      >
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Panel className="relative bg-white rounded-lg max-w-2xl w-full mx-auto p-8 shadow-xl max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-none">
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold">{student.first_name} {student.last_name}</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div>
                <button
                  onClick={() => toggleSection('personalInfo')}
                  className="w-full flex justify-between items-center text-lg font-semibold text-gray-900 focus:outline-none"
                >
                  Персональная информация
                  {sections.personalInfo ? (
                    <ChevronUp className="h-5 w-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-600" />
                  )}
                </button>
                {sections.personalInfo && (
                  <motion.div
                    initial={{ maxHeight: 0, opacity: 0 }}
                    animate={{ maxHeight: 1000, opacity: 1 }}
                    exit={{ maxHeight: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                    className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-base font-medium text-gray-700">Гражданство</p>
                        <p className="text-sm text-gray-600">{student.citizenship}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Cake className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-base font-medium text-gray-700">День рождения</p>
                        <p className="text-sm text-gray-600">{formatDate(student.birthday)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Send className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-base font-medium text-gray-700">Telegram</p>
                        <a
                          href={`https://t.me/${student.telegram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          {student.telegram}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-base font-medium text-gray-700">Email</p>
                        <p className="text-sm text-gray-600">{student.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-base font-medium text-gray-700">Телефон</p>
                        <p className="text-sm text-gray-600">{student.phone}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              <div>
                <button
                  onClick={() => toggleSection('educationInfo')}
                  className="w-full flex justify-between items-center text-lg font-semibold text-gray-900 focus:outline-none"
                >
                  Образование
                  {sections.educationInfo ? (
                    <ChevronUp className="h-5 w-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-600" />
                  )}
                </button>
                {sections.educationInfo && (
                  <motion.div
                    initial={{ maxHeight: 0, opacity: 0 }}
                    animate={{ maxHeight: 1000, opacity: 1 }}
                    exit={{ maxHeight: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                    className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <div className="flex items-center space-x-3">
                      <GraduationCap className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-base font-medium text-gray-700">Факультет</p>
                        <p className="text-sm text-gray-600">{student.faculty}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Book className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-base font-medium text-gray-700">Программа</p>
                        <p className="text-sm text-gray-600">{student.edu_program}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-base font-medium text-gray-700">Курс</p>
                        <p className="text-sm text-gray-600">{student.year} курс</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-base font-medium text-gray-700">Задолженности</p>
                        <p className="text-sm text-gray-600">{student.debts || 'Нет'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Star className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-base font-medium text-gray-700">Рейтинг</p>
                        <p className="text-sm text-gray-600">
                          {student.edu_rating === null ? '-' : student.edu_rating}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              <div>
                <button
                  onClick={() => toggleSection('examGrades')}
                  className="w-full flex justify-between items-center mb-4 text-lg font-semibold text-gray-900 focus:outline-none"
                >
                  Оценки за экзамены
                  {sections.examGrades ? (
                    <ChevronUp className="h-5 w-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-600" />
                  )}
                </button>
                {sections.examGrades && (
                  <motion.div
                    initial={{ maxHeight: 0, opacity: 0 }}
                    animate={{ maxHeight: 1000, opacity: 1 }}
                    exit={{ maxHeight: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                    className="ml-2 mr-8 mb-2 grid grid-cols-1 gap-2"
                  >
                    <div className="flex items-center justify-between space-x-2">
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <p className="text-base font-medium text-gray-700 whitespace-nowrap">• Цифровая грамотность:</p>
                      </div>
                      <p className="text-sm text-gray-600 text-right">
                        {student.digitalliteracyscore === 'not_taken' ? 'Не сдавал(а)' : student.digitalliteracyscore || 'Не сдавал(а)'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <p className="text-base font-medium text-gray-700 whitespace-nowrap">• Python:</p>
                      </div>
                      <p className="text-sm text-gray-600 text-right">
                        {student.pythonscore === 'not_taken' ? 'Не сдавал(а)' : student.pythonscore || 'Не сдавал(а)'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <p className="text-base font-medium text-gray-700 whitespace-nowrap">• Анализ данных:</p>
                      </div>
                      <p className="text-sm text-gray-600 text-right">
                        {student.dataanalysisscore === 'not_taken' ? 'Не сдавал(а)' : student.dataanalysisscore || 'Не сдавал(а)'}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              <div>
                <button
                  onClick={() => toggleSection('disciplines')}
                  className="w-full flex justify-between items-center text-lg font-semibold text-gray-900 focus:outline-none"
                >
                  Дисциплины и ответы
                  {sections.disciplines ? (
                    <ChevronUp className="h-5 w-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-600" />
                  )}
                </button>
                {sections.disciplines && (
                  <motion.div
                    initial={{ maxHeight: 0, opacity: 0 }}
                    animate={{ maxHeight: 1000, opacity: 1 }}
                    exit={{ maxHeight: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                    className="mt-4 space-y-6"
                  >
                    {student.primary_discipline && (
                      <div>
                        <div className="flex items-center space-x-3 mb-4">
                          <Check className="h-5 w-5 text-blue-500" />
                          <p className="text-lg font-medium text-gray-700">
                            {getDisciplineLabel(student.primary_discipline)} (
                            {student.primary_group_size}{' '}
                            {student.primary_group_size === 1 ? 'группа' : 'группы'})
                          </p>
                        </div>
                        <div className="ml-8 mr-8 space-y-4">
                          {DISCIPLINE_QUESTIONS[student.primary_discipline]?.map((question, index) => (
                            <div key={index} className={`border-t first:border-t-0 border-gray-200 ${index > 0 ? 'pt-4' : ''}`}>
                              <p className="text-base font-medium text-gray-700 mb-2 break-words max-w-full overflow-y-auto">{`${index + 1}. ${question}`}</p>
                              <div className="flex items-start space-x-3">
                                <MessageSquare className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
                                <p className="text-sm text-gray-600 break-words max-w-full max-h-40 overflow-y-auto">
                                  {getDisciplineAnswers(student.primary_discipline)[index]?.split('\n').map((line, idx) => (
                                    <p key={idx} className="text-sm text-gray-600 break-words max-w-full max-h-40 overflow-y-auto">
                                      {line}
                                    </p>
                                  )) || '-'}
                                </p>
                              </div>
                            </div>
                          )) || <p className="text-sm text-gray-600">Вопросы отсутствуют</p>}
                        </div>
                      </div>
                    )}
                    {student.secondary_discipline && (
                      <div>
                        <div className="flex items-center space-x-3 mb-4">
                          <CheckCheck className="h-5 w-5 text-blue-500" />
                          <p className="text-lg font-medium text-gray-700">
                            {getDisciplineLabel(student.secondary_discipline)} (
                            {student.secondary_group_size}{' '}
                            {student.secondary_group_size === 1 ? 'группа' : 'группы'})
                          </p>
                        </div>
                        <div className="ml-8 mr-8 space-y-4">
                          {DISCIPLINE_QUESTIONS[student.secondary_discipline]?.map((question, index) => (
                            <div key={index} className={`border-t first:border-t-0 border-gray-200 ${index > 0 ? 'pt-4' : ''}`}>
                              <p className="text-base font-medium text-gray-700 mb-2 break-words max-w-full overflow-y-auto">{`${index + 1}. ${question}`}</p>
                              <div className="flex items-start space-x-3">
                                <MessageSquare className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
                                <p className="text-sm text-gray-600 break-words max-w-full max-h-40 overflow-y-auto">
                                  {getDisciplineAnswers(student.secondary_discipline)[index]?.split('\n').map((line, idx) => (
                                    <p key={idx} className="text-sm text-gray-600 break-words max-w-full max-h-40 overflow-y-auto">
                                      {line}
                                    </p>
                                  )) || '-'}
                                </p>
                              </div>
                            </div>
                          )) || <p className="text-sm text-gray-600">Вопросы отсутствуют</p>}
                        </div>
                      </div>
                    )}
                    {!student.primary_discipline && !student.secondary_discipline && (
                      <p className="text-sm text-gray-600">Дисциплины не выбраны</p>
                    )}
                  </motion.div>
                )}
              </div>

              <div>
                <button
                  onClick={() => toggleSection('motivationAchievements')}
                  className="w-full flex justify-between items-center text-lg font-semibold text-gray-900 focus:outline-none"
                >
                  Мотивация и достижения
                  {sections.motivationAchievements ? (
                    <ChevronUp className="h-5 w-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-600" />
                  )}
                </button>
                {sections.motivationAchievements && (
                  <motion.div
                    initial={{ maxHeight: 0, opacity: 0 }}
                    animate={{ maxHeight: 1000, opacity: 1 }}
                    exit={{ maxHeight: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                    className="mt-4 space-y-6"
                  >
                    <div className="flex items-start space-x-3">
                      <Target className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      <div>
                        <p className="text-base font-medium text-gray-700">Мотивация</p>
                        <p className="text-sm text-gray-600">{student.motivation_text || 'Не указано'}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Award className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      <div>
                        <p className="text-base font-medium text-gray-700">Достижения</p>
                        <p className="text-sm text-gray-600">{student.achievements || 'Не указано'}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Briefcase className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      <div>
                        <p className="text-base font-medium text-gray-700">Опыт</p>
                        <p className="text-sm text-gray-600">{student.experience || 'Не указано'}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              <div>
                <button
                  onClick={() => toggleSection('recommendation')}
                  className="w-full flex justify-between items-center text-lg font-semibold text-gray-900 focus:outline-none"
                >
                  Рекомендация
                  {sections.recommendation ? (
                    <ChevronUp className="h-5 w-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-600" />
                  )}
                </button>
                {sections.recommendation && (
                  <motion.div
                    initial={{ maxHeight: 0, opacity: 0 }}
                    animate={{ maxHeight: 1000, opacity: 1 }}
                    exit={{ maxHeight: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                    className="mt-4"
                  >
                    <div className="flex items-center space-x-3">
                      <UserCheck className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-base font-medium text-gray-700">
                          Email преподавателя для рекомендации
                        </p>
                        <p className="text-sm text-gray-600">{student.teacher_email || '-'}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="mt-6">
                {pageType === 'dashboard' ? (
                  <button
                    onClick={() => handleBook()}
                    className="w-full py-3 px-4 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  >
                    Удалить ассистента
                  </button>
                ) : (
                  <button
                    onClick={() => handleBook()}
                    className="w-full py-3 px-4 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                  >
                    Забронировать ассистента
                  </button>
                )}
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </motion.div>
    </Dialog>
  );
};

export default StudentDetailsModal;