import React from "react";
import HistoryCard from "../../components/student/HistoryCard";

const sessionHistory = [
  {
    topic: "Searching",
    difficulty: "Easy",
    questionImage: "",
    startDate: new Date(),
    userImage:"",
  }
]

const HistoryPage = () => {
  return (
    <div className="flex flex-col h-full w-full bg-gray-100 justify-center">
      <p className="text-center text-4xl font-bold py-4">
        MATCH HISTORY 
      </p>

      <div className="max-w-full h-[80vh] bg-gray-100 mx-4 justify-between gap-4 custom-scrollbar rounded-lg mb-1">
        {sessionHistory.map((session, index) => (
          <HistoryCard 
            key={index}
            topic={session.topic}
            difficulty={session.difficulty}
            questionImage={session.questionImage} // Pass question image if available
            date={session.startDate} // Format date
            userImage={session.userImage} // Pass user image if available
          />
        ))}
      </div>
    </div>

  );
};

export default HistoryPage;
