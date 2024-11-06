import React, { useState } from "react";
import categories from "../../config/categoryConfig";
import startBackground from "../../assets/start-background.jpg"

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
      <div class="flex h-screen">
        <div class="flex flex-col w-1/2 justify-end items-start bg-gray-800 p-8 text-white">
          <p className="text-5xl text-[#0F0A3C] font-bold m-4">
              PEERPREP
          </p>

          <p className="flex text-xl text-[#0F0A3C] text-center p-8">
            Ready to find your perfect match? Click the button to start now!
          </p>
        </div>

        <div class="flex flex-col w-1/2 bg-white p-8 text-gray-800">
          <div 
            className="flex items-center justify-center my-4"
          >
            <button type="submit" className="btn justify-center align-middle p-4 font-bold text-3xl rounded-full h-48 w-48 my-8">
              START
            </button>
          </div>

          {/* for the translucent background, one for category, one for difficulty */}
          <div class="bg-white/20 backdrop-blur-md text-white p-4 rounded-lg shadow-lg w-48">

          </div>

          <div className="flex flex-col form-group mb-4 mt-4">
            <div className="col">
              <label className="gray-label flex justify-center items-align text-xl font-semibold mb-2" htmlFor="category">
                Category
              </label>

              <div className="row-md-8">
                <div className="multi-select">
                  <select
                    id="categories"
                    defaultValue=""
                    onChange={handleCategoryChange}
                    className="block mx-auto py-3 px-5 text-center w-[75%] rounded-lg border-1 border-black bg-white text-black focus:outline-none text-lg"
                    // required
                  >
                    <option value="" disabled>
                      Please select a topic
                    </option>
                    {/* Use categories from config file */}
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
            </div>

            <div className="col">
              <label className="gray-label flex justify-center items-align text-xl font-semibold mb-2" htmlFor="difficulty">
                Difficulty
              </label>
              <select
                type="text"
                className="block mx-auto py-3 px-5 text-center w-[75%] rounded-lg border-1 border-black bg-white text-black focus:outline-none text-lg"
                id="difficulty"
                name="difficulty"
                value={difficulty}
                placeholder="difficulty"
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
          </div>
        </div>
      </div>
    </form>
  );
};

export default MatchForm;
