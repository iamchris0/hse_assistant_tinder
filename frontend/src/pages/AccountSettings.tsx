import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Lock, Eye, EyeOff, Check, ChevronDown, ChevronUp,
  Send, Phone, Globe, Cake, GraduationCap, Book,
  MessageSquare, UserCheck, Save, CircleUser
} from 'lucide-react';

interface StudentProfile {
  email: string;
  telegram: string;
  birthday: string;
  citizenship: string;
  phone: string;
  faculty: string;
  program: string;
  year: number;
  debts: string;
  edu_rating: string;
  digitalliteracyscore: string;
  pythonscore: string;
  dataanalysisscore: string;
  primary_discipline: string;
  primary_group_size: number;
  secondary_discipline: string;
  secondary_group_size: number;
  motivation_text: string;
  achievements: string;
  experience: string;
  recommendation_available: boolean;
  teacher_email: string;
}

const DISCIPLINES = [
  { value: 'data_analysis', label: 'Анализ данных' },
  { value: 'python_programming', label: 'Программирование на Python' },
  { value: 'machine_learning', label: 'Машинное обучение' },
  { value: 'digital_literacy', label: 'Цифровая грамотность' }
];

const AccountSettings: React.FC = () => {
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  
  // Basic user info state
  const [basicInfo, setBasicInfo] = useState({
    email: user?.email || '',
    password: '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || ''
  });

  // Expanded sections state for student profile
  const [expandedSections, setExpandedSections] = useState({
    basic: false,
    personal: false,
    education: false,
    disciplines: false,
    motivation: false,
    recommendation: false
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  useEffect(() => {
    if (user?.role === 'student') {
      fetchStudentProfile();
    }
  }, [user]);

  const fetchStudentProfile = async () => {
    try {
      const response = await fetch(`/api/students/${user?.id}/profile`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при получении профиля студента');
      }
      const data = await response.json();
      setStudentProfile(data.profile);
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleBasicInfoSave = async () => {
    try {
      const response = await fetch(`/api/users/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(basicInfo)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при обновлении основной информации');
      }
      showSuccessMessage('Основная информация обновлена');
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  const handleStudentProfileSave = async (section: string) => {
    try {
      const response = await fetch(`/api/students/${user?.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...studentProfile, section })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при обновлении профиля');
      }
      showSuccessMessage('Профиль обновлен');
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

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
      
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-1 sm:p-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">
              Настройки аккаунта
            </h1>

            {/* Success Message */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-4 p-4 bg-green-50 rounded-md flex items-center"
                >
                  <Check className="h-5 w-5 text-green-400 mr-2" />
                  <span className="text-green-700">{successMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Basic Info Section */}
            <div className="mb-8">
              <button
                onClick={() => toggleSection('basic')}
                className="w-full flex justify-between items-center text-lg font-semibold text-gray-900 mb-4"
              >
                <span className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Основная информация
                </span>
                {expandedSections.basic ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>

              {expandedSections.basic && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={basicInfo.email}
                        onChange={(e) => setBasicInfo({ ...basicInfo, email: e.target.value })}
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Пароль
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={basicInfo.password}
                        onChange={(e) => setBasicInfo({ ...basicInfo, password: e.target.value })}
                        className="pl-10 pr-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Имя
                      </label>
                      <input
                        type="text"
                        value={basicInfo.first_name}
                        onChange={(e) => setBasicInfo({ ...basicInfo, first_name: e.target.value })}
                        className="mt-2 pl-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Фамилия
                      </label>
                      <input
                        type="text"
                        value={basicInfo.last_name}
                        onChange={(e) => setBasicInfo({ ...basicInfo, last_name: e.target.value })}
                        className="mt-1 pl-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleBasicInfoSave}
                      className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Сохранить
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Student-specific sections */}
            {user?.role === 'student' && studentProfile && (
              <>
                {/* Personal Info Section */}
                <div className="mb-8">
                  <button
                    onClick={() => toggleSection('personal')}
                    className="w-full flex justify-between items-center text-lg font-semibold text-gray-900 mb-4"
                  >
                    <span className="flex items-center">
                      <CircleUser className="h-5 w-5 mr-2" />
                      Личная информация
                    </span>
                    {expandedSections.personal ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>

                  {expandedSections.personal && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Telegram
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                              <Send className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              value={studentProfile.telegram}
                              onChange={(e) => setStudentProfile({
                                ...studentProfile,
                                telegram: e.target.value
                              })}
                              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Телефон
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                              <Phone className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              value={studentProfile.phone}
                              onChange={(e) => setStudentProfile({
                                ...studentProfile,
                                phone: e.target.value
                              })}
                              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Гражданство
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                              <Globe className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              value={studentProfile.citizenship}
                              onChange={(e) => setStudentProfile({
                                ...studentProfile,
                                citizenship: e.target.value
                              })}
                              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Дата рождения
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                              <Cake className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="date"
                              value={studentProfile.birthday}
                              onChange={(e) => setStudentProfile({
                                ...studentProfile,
                                birthday: e.target.value
                              })}
                              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={() => handleStudentProfileSave('personal')}
                          className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Сохранить
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Education Section */}
                <div className="mb-8">
                  <button
                    onClick={() => toggleSection('education')}
                    className="w-full flex justify-between items-center text-lg font-semibold text-gray-900 mb-4"
                  >
                    <span className="flex items-center">
                      <GraduationCap className="h-5 w-5 mr-2" />
                      Образование
                    </span>
                    {expandedSections.education ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>

                  {expandedSections.education && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Факультет
                          </label>
                          <input
                            type="text"
                            value={studentProfile.faculty}
                            onChange={(e) => setStudentProfile({
                              ...studentProfile,
                              faculty: e.target.value
                            })}
                            className="mt-1 pl-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Программа
                          </label>
                          <input
                            type="text"
                            value={studentProfile.program}
                            onChange={(e) => setStudentProfile({
                              ...studentProfile,
                              program: e.target.value
                            })}
                            className="mt-1 pl-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Курс
                          </label>
                          <select
                            value={studentProfile.year}
                            onChange={(e) => setStudentProfile({
                              ...studentProfile,
                              year: parseInt(e.target.value)
                            })}
                            className="mt-1 pl-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          >
                            {[1, 2, 3, 4, 5, 6].map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Рейтинг
                          </label>
                          <input
                            type="text"
                            value={studentProfile.edu_rating}
                            onChange={(e) => setStudentProfile({
                              ...studentProfile,
                              edu_rating: e.target.value
                            })}
                            className="mt-1 pl-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Задолженности
                        </label>
                        <select
                          value={studentProfile.debts}
                          onChange={(e) => setStudentProfile({
                            ...studentProfile,
                            debts: e.target.value
                          })}
                          className="mt-1 pl-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="Нет">Нет</option>
                          <option value="Да">Да</option>
                          <option value="Да, но по уважительной причине">
                            Да, но по уважительной причине
                          </option>
                        </select>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={() => handleStudentProfileSave('education')}
                          className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Сохранить
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Disciplines Section */}
                <div className="mb-8">
                  <button
                    onClick={() => toggleSection('disciplines')}
                    className="w-full flex justify-between items-center text-lg font-semibold text-gray-900 mb-4"
                  >
                    <span className="flex items-center">
                      <Book className="h-5 w-5 mr-2" />
                      Дисциплины
                    </span>
                    {expandedSections.disciplines ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>

                  {expandedSections.disciplines && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-6"
                    >
                      {/* Primary Discipline */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Приоритетная дисциплина
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Выберите дисциплину
                            </label>
                            <select
                              value={studentProfile.primary_discipline}
                              onChange={(e) => setStudentProfile({
                                ...studentProfile,
                                primary_discipline: e.target.value
                              })}
                              className="mt-1 pl-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                              {DISCIPLINES.map((discipline) => (
                                <option key={discipline.value} value={discipline.value}>
                                  {discipline.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Количество групп
                            </label>
                            <select
                              value={studentProfile.primary_group_size}
                              onChange={(e) => setStudentProfile({
                                ...studentProfile,
                                primary_group_size: parseInt(e.target.value)
                              })}
                              className="mt-1 pl-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value={1}>1 группа</option>
                              <option value={2}>2 группы</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Secondary Discipline */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Вторая дисциплина
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Выберите дисциплину
                            </label>
                            <select
                              value={studentProfile.secondary_discipline}
                              onChange={(e) => setStudentProfile({
                                ...studentProfile,
                                secondary_discipline: e.target.value
                              })}
                              className="mt-1 pl-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Нет</option>
                              {DISCIPLINES.filter(d => d.value !== studentProfile.primary_discipline).map((discipline) => (
                                <option key={discipline.value} value={discipline.value}>
                                  {discipline.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {studentProfile.secondary_discipline && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Количество групп
                              </label>
                              <select
                                value={studentProfile.secondary_group_size}
                                onChange={(e) => setStudentProfile({
                                  ...studentProfile,
                                  secondary_group_size: parseInt(e.target.value)
                                })}
                                className="mt-1 pl-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value={1}>1 группа</option>
                                <option value={2}>2 группы</option>
                              </select>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={() => handleStudentProfileSave('disciplines')}
                          className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Сохранить
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Motivation Section */}
                <div className="mb-8">
                  <button
                    onClick={() => toggleSection('motivation')}
                    className="w-full flex justify-between items-center text-lg font-semibold text-gray-900 mb-4"
                  >
                    <span className="flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Мотивация и достижения
                    </span>
                    {expandedSections.motivation ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>

                  {expandedSections.motivation && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Мотивация
                        </label>
                        <textarea
                          value={studentProfile.motivation_text}
                          onChange={(e) => setStudentProfile({
                            ...studentProfile,
                            motivation_text: e.target.value
                          })}
                          rows={4}
                          className="mt-1 pl-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Достижения
                        </label>
                        <textarea
                          value={studentProfile.achievements}
                          onChange={(e) => setStudentProfile({
                            ...studentProfile,
                            achievements: e.target.value
                          })}
                          rows={4}
                          className="mt-1 pl-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Опыт
                        </label>
                        <textarea
                          value={studentProfile.experience}
                          onChange={(e) => setStudentProfile({
                            ...studentProfile,
                            experience: e.target.value
                          })}
                          rows={4}
                          className="mt-1 pl-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={() => handleStudentProfileSave('motivation')}
                          className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Сохранить
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Recommendation Section */}
                <div className="mb-8">
                  <button
                    onClick={() => toggleSection('recommendation')}
                    className="w-full flex justify-between items-center text-lg font-semibold text-gray-900 mb-4"
                  >
                    <span className="flex items-center">
                      <UserCheck className="h-5 w-5 mr-2" />
                      Рекомендация
                    </span>
                    {expandedSections.recommendation ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>

                  {expandedSections.recommendation && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Есть ли рекомендация?
                        
                        </label>
                        <select
                          value={studentProfile.recommendation_available ? 'yes' : 'no'}
                          onChange={(e) => setStudentProfile({
                            ...studentProfile,
                            recommendation_available: e.target.value === 'yes'
                          })}
                          className="mt-1 pl-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="yes">Да</option>
                          <option value="no">Нет</option>
                        </select>
                      </div>

                      {studentProfile.recommendation_available && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Email преподавателя
                          </label>
                          <input
                            type="email"
                            value={studentProfile.teacher_email}
                            onChange={(e) => setStudentProfile({
                              ...studentProfile,
                              teacher_email: e.target.value
                            })}
                            className="mt-1 pl-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      )}

                      <div className="flex justify-end">
                        <button
                          onClick={() => handleStudentProfileSave('recommendation')}
                          className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Сохранить
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccountSettings;