import React, { useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ChevronLeft, BookOpen } from 'lucide-react';

const BLOCKS = [
  { id: 'personal', title: 'Информация о себе' },
  { id: 'education', title: 'Образование' },
  { id: 'primary', title: 'Приоритетная дисциплина' },
  { id: 'secondary', title: 'Второй приоритет' },
  { id: 'motivation', title: 'Мотивация' },
  { id: 'recommendations', title: 'Рекомендации' }
];

const DISCIPLINES = [
  { value: 'digital_literacy', label: 'Цифровая грамотность' },
  { value: 'python_programming', label: 'Программирование на Python' },
  { value: 'data_analysis', label: 'Анализ данных' },
  { value: 'machine_learning', label: 'Машинное обучение' }
];

const DISCIPLINE_QUESTIONS: Record<string, (string | ReactNode)[]> = {
  data_analysis: [
    "Как вы объясните студенту разницу между медианой и средним?",
    "Анализируем датасет по пиццериям. Задача найти название ресторана (Restaurant),\
     где стоимость пиццы (Price) максимальна. Студент написал следующий код. Исправьте ошибки студента в коде (не меняя логики решения) и \
     поясните каждую ошибку, которую допустил студент:",
  ],
  digital_literacy: [
    <>Приложите ссылку на вашу попытку сдачи экзамена в разделе Случайный <a href="https://edu.hse.ru/mod/quiz/view.php?id=507480" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">вариант</a> Открытого банка НЭ:</>,
    "Выберите вопрос из вашей случайной попытки и представьте, что к вам обратился студент с просьбой его пояснить. Как вы ответите?",
    "Расскажите, на чём бы вы сфокусировались, если бы вас попросили провести консультацию по Независимому экзамену?"
  ],
  python_programming: [
    "Студент спрашивает: есть while, а есть while True — в чем разница? Как вообще в этом разобраться? Что такое break и continue? \
    Почему у меня завис код при запуске?",
    "Студент спрашивает: как работает цикл for? С какими данными? for i in range() ... что такое i и range? Почему, если написать вместо \
    i что-то другое, тоже будет работать? Я пытаюсь в цикле for поменять элементы списка/кортежа, но у меня ничего не изменяется, почему?",
    "Студент спрашивает: я пытаюсь в качестве ключа словаря сделать список, но программа ругается...Как мне сразу обратиться и к ключу, и к значению? \
    Предположим, что у меня есть данные по студентам и их оценкам за тест, и я хочу в качестве ключей сделать оценки, но часть данных теряется — \
    как это исправить? Как отсортировать словарь по значениям? А если в словаре ключ — это имя студента, а значение — список с оценками за три теста: \
    как мне вывести фамилии студентов в зависимости от из оценки за первый тест (от большей к меньшей)?",
  ],
  machine_learning: [
    "Студент говорит, что хочет научиться рисовать красивые графики — например, при визуализации выборки. Что вы посоветуете ему почитать?"
  ]
};

const Questionnaire: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [showWelcome, setShowWelcome] = useState(true);
  const [currentBlock, setCurrentBlock] = useState(0);
  const [completedBlocks, setCompletedBlocks] = useState<number[]>([]);

  const [formData, setFormData] = useState({
    telegram: '',
    birthday: '',
    citizenship: '',
    email: '',
    phone: '',
    faculty: '',
    program: '',
    year: '',
    gpa: '',
    debts: '',
    edu_rating: '',
    primaryDiscipline: '',
    primaryGroupSize: 1,
    primaryQuestion1: '',
    primaryQuestion2: '',
    primaryQuestion3: '',
    secondaryDiscipline: '',
    secondaryGroupSize: 1,
    secondaryQuestion1: '',
    secondaryQuestion2: '',
    secondaryQuestion3: '',
    motivationText: '',
    achievements: '',
    experience: '',
    recommendationAvailable: 'no',
    teacherEmail: '',
    digitalliteracyscore: '',
    pythonscore: '',
    dataanalysisscore: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateBlock = (blockId: string): boolean => {
    const newErrors: { [key: string]: string } = {};
  
    switch (blockId) {
      case 'personal':
        if (!formData.telegram || !formData.telegram.startsWith('@')) newErrors.telegram = 'Пожалуйста, укажите ваш Telegram в формате @...';
        if (!formData.birthday) newErrors.birthday = 'Пожалуйста, укажите дату рождения.';
        if (!formData.citizenship) newErrors.citizenship = 'Пожалуйста, укажите гражданство.';
        if (!formData.email || !formData.email.endsWith('@edu.hse.ru')) newErrors.email = 'Пожалуйста, укажите электронную почту в формате ...@edu.hse.ru';
        if (!formData.phone) newErrors.phone = 'Пожалуйста, укажите номер телефона.';
        break;
      case 'education':
        if (!formData.faculty) newErrors.faculty = 'Пожалуйста, укажите факультет.';
        if (!formData.program) newErrors.program = 'Пожалуйста, укажите образовательную программу.';
        if (!formData.year) newErrors.year = 'Пожалуйста, выберите курс.';
        if (!formData.debts) newErrors.debts = 'Пожалуйста, укажите, есть ли задолженности.';
        if (!formData.edu_rating) {
          newErrors.edu_rating = 'Пожалуйста, укажите ваш рейтинг.';
        } else {
          const ratingRegex = /^\d+\s+из\s+\d+$/;
          if (!ratingRegex.test(formData.edu_rating)) {
            newErrors.edu_rating = 'Рейтинг должен быть в формате "1 из 100"';
          }
        }
        break;
      case 'primary':
        if (!formData.primaryDiscipline) newErrors.primaryDiscipline = 'Пожалуйста, выберите дисциплину.';
        break;
      case 'recommendations':
        if (!formData.recommendationAvailable) newErrors.recommendationAvailable = 'Пожалуйста, выберите, есть ли рекомендация.';
        if (formData.recommendationAvailable === 'yes' && !formData.teacherEmail && !formData.teacherEmail.includes('@')) {
          newErrors.teacherEmail = 'Пожалуйста, укажите email преподавателя.';
        }
        break;
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const clearBlock = (blockId: string) => {
    switch (blockId) {
      case 'personal':
        setFormData(prev => ({
          ...prev,
          telegram: '',
          birthday: '',
          citizenship: '',
          email: '',
          phone: '',
        }));
        break;
      case 'education':
        setFormData(prev => ({
          ...prev,
          faculty: '',
          program: '',
          year: '',
          debts: '',
          digitalliteracyscore: '',
          pythonscore: '',
          dataanalysisscore: '',
          edu_rating: '',
        }));
        break;
      case 'primary':
        setFormData(prev => ({
          ...prev,
          primaryDiscipline: '',
          primaryGroupSize: 1,
          primaryQuestion1: '',
          primaryQuestion2: '',
          primaryQuestion3: '',
        }));
        break;
      case 'secondary':
        setFormData(prev => ({
          ...prev,
          secondaryDiscipline: '',
          secondaryGroupSize: 1,
          secondaryQuestion1: '',
          secondaryQuestion2: '',
          secondaryQuestion3: '',
        }));
        break;
      case 'motivation':
        setFormData(prev => ({
          ...prev,
          motivationText: '',
          achievements: '',
          experience: '',
        }));
        break;
      case 'recommendations':
        setFormData(prev => ({
          ...prev,
          recommendationAvailable: '',
          teacherEmail: '',
        }));
        break;
    }
    setErrors({});
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' })); // Clear error for this field
  };

  const handleStartForm = () => {
    setShowWelcome(false);
  };

  const handleNextBlock = () => {
    if (validateBlock(BLOCKS[currentBlock].id)) {
      if (!completedBlocks.includes(currentBlock)) {
        setCompletedBlocks([...completedBlocks, currentBlock]);
      }
      setCurrentBlock(prev => prev + 1);
    }
  };

  const handlePreviousBlock = () => {
    setCurrentBlock(prev => prev - 1);
  };

  const canNavigateToBlock = (blockIndex: number) => {
    return blockIndex <= Math.max(...completedBlocks, 0);
  };

  const handleSubmit = async () => {
    if (!validateBlock(BLOCKS[currentBlock].id)) return;
  
    try {
      const dataAnalysisAnswers = formData.primaryDiscipline === 'data_analysis'
        ? [formData.primaryQuestion1, formData.primaryQuestion2]
        : formData.secondaryDiscipline === 'data_analysis'
        ? [formData.secondaryQuestion1, formData.secondaryQuestion2]
        : [];
  
      const pythonProgrammingAnswers = formData.primaryDiscipline === 'python_programming'
        ? [formData.primaryQuestion1, formData.primaryQuestion2, formData.primaryQuestion3]
        : formData.secondaryDiscipline === 'python_programming'
        ? [formData.secondaryQuestion1, formData.secondaryQuestion2, formData.secondaryQuestion3]
        : [];
  
      const machineLearningAnswers = formData.primaryDiscipline === 'machine_learning'
        ? [formData.primaryQuestion1]
        : formData.secondaryDiscipline === 'machine_learning'
        ? [formData.secondaryQuestion1]
        : [];
  
      const digitalLiteracyAnswers = formData.primaryDiscipline === 'digital_literacy'
        ? [formData.primaryQuestion1, formData.primaryQuestion2, formData.primaryQuestion3]
        : formData.secondaryDiscipline === 'digital_literacy'
        ? [formData.secondaryQuestion1, formData.secondaryQuestion2, formData.secondaryQuestion3]
        : [];
  
      // Transform exam scores: 'not_taken' to null, numeric strings to numbers, or null if not set
      const transformScore = (score: string | undefined) => {
        if (score === 'not_taken') return null;
        return score ? parseInt(score, 10) : null;
      };
  
      const transformedFormData = {
        ...formData,
        digitalliteracyscore: transformScore(formData.digitalliteracyscore),
        pythonscore: transformScore(formData.pythonscore),
        dataanalysisscore: transformScore(formData.dataanalysisscore),
        year: formData.year ? parseInt(formData.year, 10) : null, // Ensure year is a number
        primaryGroupSize: formData.primaryGroupSize || 1,
        secondaryGroupSize: formData.secondaryGroupSize || 1,
        recommendationAvailable: formData.recommendationAvailable === 'yes' ? true : formData.recommendationAvailable === 'no' ? false : null,
      };
  
      const response = await fetch(`/api/students/${user?.id}/questionnaire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...transformedFormData,
          dataAnalysisAnswers,
          pythonProgrammingAnswers,
          machineLearningAnswers,
          digitalLiteracyAnswers,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при сохранении анкеты');
      }
  
      navigate('/groups');
    } catch (error) {
      console.error('Error saving questionnaire:', error);
    }
  };

  const renderEducationBlock = () => (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">Образование</h1>
  
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label className="text-lg font-semibold text-gray-700 pl-2">
            Факультет <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="faculty"
            value={formData.faculty}
            onChange={handleInputChange}
            className={`mt-1 text-sm w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-2 ${errors.faculty ? 'border-red-500' : ''}`}
            placeholder="ФКН"
          />
          {errors.faculty && <p className="text-red-500 text-sm mt-1 pl-2">{errors.faculty}</p>}
        </div>
  
        <div className="flex flex-col">
          <label className="text-lg font-semibold text-gray-700 pl-2">
            Образовательная программа <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="program"
            value={formData.program}
            onChange={handleInputChange}
            className={`mt-1 text-sm w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-2 ${errors.program ? 'border-red-500' : ''}`}
            placeholder="ПМИ"
          />
          {errors.program && <p className="text-red-500 text-sm mt-1 pl-2">{errors.program}</p>}
        </div>
  
        <div className="flex flex-col">
          <label className="text-lg font-semibold text-gray-700 pl-2">
            Курс <span className="text-red-500">*</span>
          </label>
          <select
            name="year"
            value={formData.year}
            onChange={handleInputChange}
            className={`mt-1 text-sm w-full rounded-md p-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-2 ${errors.year ? 'border-red-500' : ''}`}
          >
            <option value="">Выберите курс</option>
            {[1, 2, 3, 4, 5, 6].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          {errors.year && <p className="text-red-500 text-sm mt-1 pl-2">{errors.year}</p>}
        </div>
  
        <div className="flex flex-col">
          <label className="text-lg font-semibold text-gray-700 pl-2">
            Есть ли задолженности? <span className="text-red-500">*</span>
          </label>
          <select
            name="debts"
            value={formData.debts}
            onChange={handleInputChange}
            className={`mt-1 text-sm w-full p-2 rounded-md border-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-2 ${errors.debts ? 'border-red-500' : ''}`}
          >
            <option value="">Выберите...</option>
            <option value="Нет">Нет</option>
            <option value="Да">Да</option>
            <option value="Да, но по уважительной причине">
              Да, но по уважительной причине
            </option>
          </select>
          {errors.debts && <p className="text-red-500 text-sm mt-1 pl-2">{errors.debts}</p>}
        </div>
  
        <div className="flex flex-col col-span-2">
          <label className="text-lg font-semibold text-gray-700 pl-2">
            Ваш <u>текущий</u> рейтинг <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="edu_rating"
            value={formData.edu_rating}
            onChange={handleInputChange}
            className={`mt-1 text-sm w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-2 ${errors.edu_rating ? 'border-red-500' : ''}`}
            placeholder="1 из 100"
          />
          {errors.edu_rating && <p className="text-red-500 text-sm mt-1 pl-2">{errors.edu_rating}</p>}
        </div>
      </div>
  
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4 text-center">
          Оценки за независимые экзамены
        </h3>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Экзамен
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Оценка
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                { name: 'Цифровая грамотность', field: 'digitalliteracyscore' },
                { name: 'Программирование', field: 'pythonscore' },
                { name: 'Анализ данных', field: 'dataanalysisscore' }
              ].map((exam, index) => (
                <tr key={exam.field} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {exam.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-col items-start">
                      <div className="flex flex-wrap items-center gap-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                          <label key={score} className="inline-flex items-center">
                            <input
                              type="radio"
                              name={exam.field}
                              value={score.toString()} // Ensure value is a string
                              onChange={handleInputChange}
                              className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              checked={formData[exam.field as keyof typeof formData] === score.toString()}
                            />
                            <span className="ml-1">{score}</span>
                          </label>
                        ))}
                      </div>
                      <div className="flex items-center mt-2">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name={exam.field}
                            value="not_taken"
                            onChange={handleInputChange}
                            className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            checked={formData[exam.field as keyof typeof formData] === 'not_taken'}
                          />
                          <span className="ml-1">Не сдавал(а)</span>
                        </label>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderBlock = () => {
    switch (BLOCKS[currentBlock].id) {
      case 'personal':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Информация о себе</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 pl-3">
                Telegram <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="telegram"
                required
                value={formData.telegram}
                onChange={handleInputChange}
                className={`mt-1 block w-full p-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3 ${errors.telegram ? 'border-red-500' : ''}`}
                placeholder="@username"
              />
              {errors.telegram && <p className="text-red-500 text-sm mt-1 pl-3">{errors.telegram}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 pl-3">
                Дата рождения <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="birthday"
                required
                value={formData.birthday}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3 ${errors.birthday ? 'border-red-500' : ''}`}
              />
              {errors.birthday && <p className="text-red-500 text-sm mt-1 pl-3">{errors.birthday}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 pl-3">
                Гражданство <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="citizenship"
                required
                value={formData.citizenship}
                onChange={handleInputChange}
                className={`mt-1 block w-full p-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3 ${errors.citizenship ? 'border-red-500' : ''}`}
                placeholder="РФ"
              />
              {errors.citizenship && <p className="text-red-500 text-sm mt-1 pl-3">{errors.citizenship}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 pl-3">
                Электронная почта <u>EDU.HSE</u> <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className={`mt-1 block w-full p-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3 ${errors.email ? 'border-red-500' : ''}`}
                placeholder="student@edu.hse.com"
                pattern="@edu\.hse"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1 pl-3">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 pl-3">
                Номер телефона <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                className={`mt-1 block w-full p-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3 ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="+7 (***) ***-**-**"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1 pl-3">{errors.phone}</p>}
            </div>
          </div>
        );
  
      case 'education':
        return renderEducationBlock();
  
      case 'primary':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-xl font-semibold">Приоритетная дисциплина</h1>
              <p className="text-sm text-gray-500">
                Со списком дисциплин и образовательных программ, на которых они читаются, можно ознакомиться по{' '}
                <a
                  href="https://docs.google.com/spreadsheets/d/1o8fQKSrxz9jBJKOucxIIuVmNMcneLAKeWlSVpvcuTbE/edit?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700"
                >
                  ссылке
                </a>.
              </p>
            </div>
  
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-1 pl-2">
                Выберите дисциплину <span className="text-red-500">*</span>
              </label>
              <select
                name="primaryDiscipline"
                value={formData.primaryDiscipline}
                onChange={handleInputChange}
                className={`block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-1 ${errors.primaryDiscipline ? 'border-red-500' : ''}`}
              >
                <option value="">-</option>
                {DISCIPLINES.map((discipline) => (
                  <option key={discipline.value} value={discipline.value}>
                    {discipline.label}
                  </option>
                ))}
              </select>
              {errors.primaryDiscipline && <p className="text-red-500 text-sm mt-1 pl-2">{errors.primaryDiscipline}</p>}
            </div>
  
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-1 pl-2">
                Какое количество групп по курсу вы готовы взять?
              </label>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, primaryGroupSize: num }))}
                    className={`py-2 px-4 rounded-md text-sm font-medium ${
                      formData.primaryGroupSize === num
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {num} {num === 1 ? 'группа' : 'группы'}
                  </button>
                ))}
              </div>
            </div>
  
            {formData.primaryDiscipline && DISCIPLINE_QUESTIONS[formData.primaryDiscipline]?.map((question, index) => (
              <div key={index} className="flex flex-col">
                <label className="text-md font-medium text-gray-700 pl-2">
                  {question}
                </label>
                {index === 1 && formData.primaryDiscipline === 'data_analysis' && (
                  <img src="/images/andan.png" alt="Andan" className="mt-2" />
                )}
                <textarea
                  className="mt-1 rounded-md pt-1 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-y pl-2"
                  name={`primaryQuestion${index + 1}`}
                  value={formData[`primaryQuestion${index + 1}` as keyof typeof formData] || ''}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Введите ваш ответ..."
                />
              </div>
            ))}
          </div>
        );
  
      case 'secondary':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-xl font-semibold">Дисциплина 2</h1>
              <p className="text-sm text-gray-500">Какой <b>еще курс (блок курсов)</b> вы рассматриваете для ассистирования?</p>
              <p className="text-sm text-gray-500">
                Со списком дисциплин и образовательных программ, на которых они читаются, можно ознакомиться по{' '}
                <a
                  href="https://docs.google.com/spreadsheets/d/1o8fQKSrxz9jBJKOucxIIuVmNMcneLAKeWlSVpvcuTbE/edit?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700"
                >
                  ссылке
                </a>.
              </p>
            </div>
  
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-1 pl-2">
                Выберите дисциплину
              </label>
              <select
                name="secondaryDiscipline"
                value={formData.secondaryDiscipline}
                onChange={handleInputChange}
                className="block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-1"
              >
                <option value="">Не рассматриваю другие дисциплины</option>
                {DISCIPLINES.filter(discipline => discipline.value !== formData.primaryDiscipline).map((discipline) => (
                  <option key={discipline.value} value={discipline.value}>
                    {discipline.label}
                  </option>
                ))}
              </select>
            </div>
  
            {formData.secondaryDiscipline !== '' && (
              <>
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-1 pl-2">
                    Какое количество групп по курсу вы готовы взять?
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, secondaryGroupSize: num }))}
                        className={`py-2 px-4 rounded-md text-sm font-medium ${
                          formData.secondaryGroupSize === num
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {num} {num === 1 ? 'группа' : 'группы'}
                      </button>
                    ))}
                  </div>
                </div>
  
                {DISCIPLINE_QUESTIONS[formData.secondaryDiscipline]?.map((question, index) => (
                  <div key={index} className="flex flex-col">
                    <label className="text-md font-medium text-gray-700 pl-2">
                      {question}
                    </label>
                    {index === 1 && formData.secondaryDiscipline === 'data_analysis' && (
                      <img src="/images/andan.png" alt="Andan" className="mt-2" />
                    )}
                    <textarea
                      className="mt-1 rounded-md pt-1 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-y pl-2"
                      name={`secondaryQuestion${index + 1}`}
                      value={formData[`secondaryQuestion${index + 1}` as keyof typeof formData] || ''}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="Введите ваш ответ..."
                    />
                  </div>
                ))}
              </>
            )}
          </div>
        );
  
      case 'motivation':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Мотивация</h2>
  
            <div className="flex flex-col">
              <label className="text-lg font-semibold text-gray-700">
              Расскажите, почему вы хотите быть ассистентом:
              </label>
              <textarea
                name="motivationText"
                value={formData.motivationText}
                onChange={handleInputChange}
                rows={4}
                className="mt-1 w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-y p-2"
                placeholder="Почему вам интересно стать ассистентом?"
              />
            </div>
  
            <div className="flex flex-col">
              <label className="text-lg font-semibold text-gray-700">
                Расскажите о ваших достижениях:
              </label>
              <textarea
                name="achievements"
                value={formData.achievements}
                onChange={handleInputChange}
                rows={4}
                className="mt-1 w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-y p-2"
                placeholder="Например, публикации, победы в конкурсах и т. п."
              />
            </div>
  
            <div className="flex flex-col">
              <label className="text-lg font-semibold text-gray-700">
                Изучали ли вы аналогичные курсы раньше?
              </label>
              <textarea
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                rows={4}
                className="mt-1 w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-y p-2"
                placeholder="Опишите, пожалуйста, ваш опыт в этой области"
              />
            </div>
          </div>
        );
  
      case 'recommendations':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Рекомендации</h2>
  
            <div className="flex flex-col">
              <label className="text-lg font-semibold text-gray-700">
                Может ли кто-то из преподавателей дать вам рекомендацию? <span className="text-red-500">*</span>
              </label>
              <select
                name="recommendationAvailable"
                onChange={handleInputChange}
                className={`w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 ${errors.recommendationAvailable ? 'border-red-500' : ''}`}
              >
                <option value="no">Нет</option>
                <option value="yes">Да</option>
              </select>
              {errors.recommendationAvailable && <p className="text-red-500 text-sm mt-1">{errors.recommendationAvailable}</p>}
            </div>
  
            {formData.recommendationAvailable === 'yes' && (
              <div className="flex flex-col">
                <label className="text-lg font-semibold text-gray-700">
                  Пожалуйста, укажите адрес электронной почты преподавателя <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="teacherEmail"
                  onChange={handleInputChange}
                  className={`mt-1 w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 ${errors.teacherEmail ? 'border-red-500' : ''}`}
                  placeholder="teacher@example.com"
                />
                {errors.teacherEmail && <p className="text-red-500 text-sm mt-1">{errors.teacherEmail}</p>}
              </div>
            )}
          </div>
        );
  
      default:
        return null;
    }
  };


  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2" />
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -translate-y-1/2 transition-all duration-300"
          style={{ width: `${(currentBlock / (BLOCKS.length - 1)) * 100}%` }}
        />

        <div className="relative flex justify-between">
          {BLOCKS.map((block, index) => (
            <div key={block.id} className="flex flex-col items-center">
              <button
                onClick={() => canNavigateToBlock(index) && setCurrentBlock(index)}
                disabled={!canNavigateToBlock(index)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 relative z-10
                  ${index <= currentBlock ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}
                  ${canNavigateToBlock(index) ? 'cursor-pointer hover:ring-2 hover:ring-blue-300' : 'cursor-not-allowed'}
                `}
              >
                {completedBlocks.includes(index) ? (
                  <Check className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </button>
              <span className="mt-6 text-xs text-center w-20">{block.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <AnimatePresence mode="wait">
        {showWelcome ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-0 flex items-center justify-center min-h-screen"
          >
            <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="mb-6">
                <BookOpen className="w-16 h-16 text-blue-600 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold mb-4">
                Привет! 🤓
              </h2>
              <h5 className="text-1xl font-bold mb-4">
                Я помощник <span style={{ color: '#dcff06', textShadow: '1px 1px 2px black, -1px -1px 2px black, 1px -1px 2px black, -1px 1px 2px black' }}>Data Culture</span>. Моя задача — помогать преподавателям и студентам.
              </h5>
              <p className="text-gray-600 mb-8">
                Пожалуйста, заполните анкету, чтобы преподаватели могли вас выбрать.
              </p>
              <button
                onClick={handleStartForm}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Заполнить
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-3xl mx-auto"
          >
            {renderProgressBar()}
  
            <motion.div
              className="bg-white rounded-lg shadow-lg p-8"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentBlock}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {renderBlock()}
                </motion.div>
              </AnimatePresence>
  
              <div className="flex justify-between mt-8">
                <div className="flex space-x-4">
                  {currentBlock > 0 && (
                    <button
                      onClick={handlePreviousBlock}
                      className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Назад
                    </button>
                  )}
                  <button
                    onClick={() => clearBlock(BLOCKS[currentBlock].id)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Очистить
                  </button>
                </div>
  
                <div className="ml-auto">
                  {currentBlock === BLOCKS.length - 1 ? (
                    <button
                      onClick={handleSubmit}
                      className="flex items-center px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Сохранить
                      <Check className="w-4 h-4 ml-2" />
                    </button>
                  ) : (
                    <button
                      onClick={handleNextBlock}
                      className="flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Далее
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Questionnaire;