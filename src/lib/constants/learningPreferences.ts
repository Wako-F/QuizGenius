export const learningPreferences = {
  difficulties: [
    { value: "easy", label: "Easy", description: "Basic concepts and straightforward questions" },
    { value: "medium", label: "Medium", description: "Balanced mix of concepts and challenges" },
    { value: "hard", label: "Hard", description: "Complex problems requiring deep understanding" },
    { value: "expert", label: "Expert", description: "Advanced concepts and expert-level challenges" },
  ],
  
  quizLengths: [
    { value: "5-10", label: "Short (5-10 questions)", description: "Quick knowledge checks" },
    { value: "10-20", label: "Medium (10-20 questions)", description: "Comprehensive coverage" },
    { value: "20-30", label: "Long (20-30 questions)", description: "In-depth assessment" },
    { value: "30-50", label: "Extended (30-50 questions)", description: "Complete subject mastery" },
  ],

  timeLimits: [
    { value: "none", label: "No Time Limit", description: "Learn at your own pace" },
    { value: "relaxed", label: "Relaxed", description: "Generous time per question" },
    { value: "standard", label: "Standard", description: "Balanced time pressure" },
    { value: "challenge", label: "Challenge", description: "Test your quick thinking" },
  ],

  interests: [
    { category: "Academic", topics: [
      "Mathematics", "Physics", "Chemistry", "Biology", "History",
      "Literature", "Geography", "Computer Science", "Economics"
    ]},
    { category: "Professional", topics: [
      "Business", "Marketing", "Finance", "Management", "Programming",
      "Data Science", "Design", "Project Management"
    ]},
    { category: "Languages", topics: [
      "English", "Spanish", "French", "German", "Chinese",
      "Japanese", "Korean", "Italian"
    ]},
    { category: "Arts & Culture", topics: [
      "Music", "Art History", "Film & Cinema", "Photography",
      "Architecture", "Fashion", "Culinary Arts"
    ]},
    { category: "Personal Development", topics: [
      "Leadership", "Communication", "Time Management",
      "Public Speaking", "Critical Thinking", "Problem Solving"
    ]},
  ],
}; 