const Question = require('../../models/question');

const getQuestionById = async (req, res, next) => {
    let question;
    try {
        question = await Question.findById(req.params.id);

        // If the question does not exist, return a 404 response
        if (question == null) {
            return res.status(404).json({ message: 'Cannot find question' });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

    res.question = question;
    next();
}

const getQuestionByCriteria = async (req, res, next) => {
    const { difficulty, categories } = req.params; 

    let questions;
    
    try {
        const categoryArray = categories.split(',').map(category => category.trim());

        // Find the questions matching the criteria
        questions = await Question.find({
            complexity: { $regex: new RegExp(difficulty, "i") },  
            category: { $in: categoryArray.map(cat => new RegExp(cat, "i")) }  
        });

        if (questions.length === 0) {
            return res.status(404).json({ message: 'No questions found for the given criteria' });
        }

        // Pick a random question
        const randomIndex = Math.floor(Math.random() * questions.length);
        const randomQuestion = questions[randomIndex];

        // Assign the random question to res.question
        res.question = randomQuestion;
        next();
        
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};




const checkDuplicateTitle = async (req, res, next) => {
    const title = req.body.title;
    try {
        const existingQuestion = await Question.findOne({ title: title });

        if (existingQuestion) {
            return res.status(400).json({ message: 'Question with this title already exists' });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

    next();
}

module.exports = {getQuestionById, checkDuplicateTitle, getQuestionByCriteria};