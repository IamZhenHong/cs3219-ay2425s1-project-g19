import React from "react";
import defaultBackground from "../../assets/test.jpg"
import defaultProfilePicture from "../../assets/default-profile-picture.jpg"

const HistoryCard = ({ topic, difficulty, questionImage, date, userImage }) => {
  return (
    <div className="relative flex items-center bg-gray-800 rounded-lg p-4 my-2">
      {/* Background Image */}
      <div
        className="w-full h-32 rounded-lg bg-cover bg-center flex justify-between items-center text-white p-4"
        style={{
          backgroundImage: `url(${questionImage || defaultBackground})`,
          backgroundSize: "cover", // Ensures the image covers the container
          backgroundPosition: "center", // Centers the image
        }}
      >
        {/* Topic and Difficulty */}
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold">{topic || "-"}</h2>
          <p className="text-lg">{difficulty || "-"}</p>
        </div>
        
        {/* Date */}
        <div className="absolute left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2 text-md text-center">
          <p>Date: {date.toLocaleDateString() || "-"}</p>
          {/* Score field, if you need it later */}
          {/* <p>Score: {score}</p> */}
        </div>
        
        {/* User Image */}
        <div className="w-16 h-16 rounded-full bg-white overflow-hidden ml-4">
          <img src={userImage || defaultProfilePicture} alt="User" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
};

export default HistoryCard;
