{userProfile?.recentActivity && userProfile.recentActivity.length > 0 ? (
  <div className="space-y-4">
    {userProfile.recentActivity.map((activity, index) => (
      <motion.div
        key={activity.timestamp.toString() + index}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700 transition-all duration-300 ${
          activity.type === 'quiz_taken' && activity.quizId 
            ? 'cursor-pointer hover:bg-gray-700/50 hover:border-indigo-500/50 transform hover:-translate-y-1' 
            : ''
        }`}
        onClick={() => {
          if (activity.type === 'quiz_taken' && activity.quizId) {
            const savedQuiz = userProfile?.savedQuizzes?.find(q => q.id === activity.quizId);
            if (savedQuiz) {
              router.push(`/quiz/${activity.quizId}`);
            }
          }
        }}
      >
        {/* Activity Icon */}
        <div className={`p-3 rounded-lg ${
          activity.type === 'quiz_taken' 
            ? 'bg-indigo-500/10 text-indigo-400'
            : activity.type === 'achievement_earned'
            ? 'bg-yellow-500/10 text-yellow-400'
            : 'bg-purple-500/10 text-purple-400'
        }`}>
          {activity.type === 'quiz_taken' ? (
            <div className="relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {activity.quizId && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
              )}
            </div>
          ) : activity.type === 'achievement_earned' ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          )}
        </div>

        {/* Activity Details */}
        <div className="flex-1">
          <p className="text-white group-hover:text-indigo-400 transition-colors">
            {activity.details}
            {activity.type === 'quiz_taken' && activity.quizId && (
              <span className="ml-2 text-sm text-indigo-400 animate-pulse">(Click to retry)</span>
            )}
          </p>
          <p className="text-sm text-gray-400">
            {new Date(activity.timestamp).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        {/* Score Badge (if applicable) */}
        {activity.type === 'quiz_taken' && activity.score !== undefined && (
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            activity.score >= 80 ? 'bg-green-500/10 text-green-400' :
            activity.score >= 60 ? 'bg-yellow-500/10 text-yellow-400' :
            'bg-red-500/10 text-red-400'
          }`}>
            {activity.score}%
          </div>
        )}
      </motion.div>
    ))}
  </div>
) : (
  <div className="text-center text-gray-400 py-8">
    <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
    <p>No recent activity yet. Start by taking or creating a quiz!</p>
  </div>
)} 