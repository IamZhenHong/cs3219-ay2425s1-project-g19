import React, { useState } from "react";
import categories from "../../config/categoryConfig";

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
      <div className="form-group mb-4">
        <div className="col">
          <label className="gray-label flex justify-center items-align text-lg text-semibold" htmlFor="category">
            Category
          </label>

          <div className="row-md-8">
            <div className="multi-select">
              <select
                id="categories"
                defaultValue=""
                onChange={handleCategoryChange}
                className="block mx-auto py-3 px-4 text-center w-[300px] rounded-lg border-1 border-black bg-white text-black focus:outline-none"
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
          <label className="gray-label flex justify-center items-align" htmlFor="difficulty">
            Difficulty
          </label>
          <select
            type="text"
            className="block mx-auto py-3 px-4 text-center w-[300px] rounded-lg border-1 border-black bg-white text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

      <div className="">
        <p className="text-xl text-[] text-center">
          Ready to find your perfect match? Click the button to start now!
        </p>
      </div>

      <div className="flex items-center justify-center">
        <button type="submit" className="btn justify-center align-middle">
          Match Now!
        </button>
      </div>
    </form>
  );
};

export default MatchForm;
