import React, { useState } from "react";
import categories from "../../config/categoryConfig";
import background from "../../assets/background.jpg";

const MatchForm = ({ onSubmit }) => {
  const [category, setCategory] = useState([]);
  const [difficulty, setDifficulty] = useState("");

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    document.getElementById("matchForm").reportValidity();
    onSubmit({ category, difficulty });
  };

  const handleCategoryChange = (event) => {
    const value = event.target.value;
    if (value && !category.includes(value)) {
      setCategory((prevCategories) => [...prevCategories, value]);
    }
    event.target.value = ""; // Reset dropdown selection
  };

  const removeCategory = (categoryToRemove) => {
    setCategory(category.filter((item) => item !== categoryToRemove));
  };

  return (
    <form id="matchForm" onSubmit={handleSubmit}>
      <div
        style={{
          backgroundImage: `url(${background})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="flex h-screen"
      >
        <div className="flex flex-col w-1/2 justify-center items-start bg-gray-800 bg-opacity-0 pl-16 text-white">
          <p className="text-9xl text-white font-bold ">CONNECT</p>
          <p className="text-9xl text-blue-200 font-bold ">CODE</p>
          <p className="text-9xl text-blue-400 font-bold ">CREATE</p>
          <p className="flex text-2xl text-white my-2">
            Start your journey with a peer who's just right for you.
          </p>
        </div>

        <div className="flex flex-col justify-center items-center w-1/2 bg-opacity-0 p-8 text-gray-800">
          <div className="flex flex-col justify-center w-3/4 items-center bg-blue-200 bg-opacity-50 backdrop-blur-md p-8 text-gray-800 rounded-4 space-y-4"> {/* New container for layout */}
            {/* Right-aligned Category */}
            <div className="flex flex-col justify-center text-white p-2 w-full">
              <label
                className="gray-label flex justify-center text-xl font-semibold mb-2"
                htmlFor="category"
              >
                Category
              </label>
              <div className="multi-select">
                <select
                  id="categories"
                  defaultValue=""
                  onChange={handleCategoryChange}
                  className="block mx-auto py-3 text-center w-full rounded-lg shadow-lg bg-blue-50 backdrop-blur-md bg-opacity-80 text-black focus:outline-none text-lg"
                >
                  <option value="" disabled className="bg-blue-50 text-black">
                    Please select a topic
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <div className="selected-categories">
                  {category.map((cat) => (
                    <span key={cat} className="tag bg-grey">
                      {cat}
                      <button
                        type="button"
                        onClick={() => removeCategory(cat)}
                        className="remove-tag"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Left-aligned Difficulty */}
            <div className="flex flex-col text-white p-2 w-full">
              <label
                className="gray-label flex justify-center text-xl font-semibold mb-2"
                htmlFor="difficulty"
              >
                Difficulty
              </label>
              <select
                type="text"
                className="block mx-auto py-3 text-center w-full rounded-lg shadow-lg bg-blue-50 backdrop-blur-md bg-opacity-80 text-black focus:outline-none text-lg"
                id="difficulty"
                name="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                required
              >
                <option value="" disabled selected>
                  Please select a difficulty
                </option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div className="flex justify-center mt-2">
              <button
                type="submit"
                className="btn justify-center align-middle p-4 font-bold text-3xl rounded-full h-48 w-48 my-8"
              >
                START
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default MatchForm;
