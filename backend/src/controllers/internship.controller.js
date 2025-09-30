const internshipModel = require('../models/internship.model')
const axios = require('axios')
const {GoogleGenerativeAI} = require('@google/generative-ai')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({model : "gemini-1.5-pro-latest"})

async function extractSkillsWithGemini(description)
{
    if(!description || description.trim().length < 20)
    {
        return []
    }

    const prompt = `You are an expert tech recruitment assistant. 
        Read the following job description and extract all the technical skills, programming languages, frameworks, and libraries mentioned.
        Return the result ONLY as a clean JSON array of strings. Do not include any other text or explanation.
        Example output: ["React", "Node.js", "MongoDB", "Express", "REST API"]
        
        Job Description:
        ---
        ${description}
        ---`;

    try
    {
        const result = await model.generateContent(prompt)
        const response = await result.response

        let text = response.text()
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const skills = JSON.parse(text)
        return Array.isArray(skills) ? skills : []
    }
    catch (error) 
    {
        console.error("Error with Gemini API, falling back to basic extraction:", error.message);

        // *** SAFETY NET ***
        // Agar Gemini fail ho, to description se hi kuch common skills nikalne ki koshish karo
        
        const commonSkills = ["React", "Node.js", "JavaScript", "Python", "MongoDB", "Express", "Java", "HTML", "CSS", "SQL"];
        
        const foundSkills = [];
        const lowerCaseDescription = description.toLowerCase();
        for (const skill of commonSkills) {
            if (lowerCaseDescription.includes(skill.toLowerCase())) {
                foundSkills.push(skill);
            }
        }
        return foundSkills;
    }
}

async function fetchAndSaveInternships(req, res)
{
    console.log('🚀 Starting to fetch internships from JSearch API...');
    console.log('👤 Request initiated by user:', req.user.name || req.user.email);
    try
    {
        const option = {
            method : 'GET',
            url : 'https://jsearch.p.rapidapi.com/search',
            params : {
                query : 'internship for web developer in India',
                page : '1',
                num_pages : '1',
                employment_types : 'INTERN'
            },

            headers : {
                'X-RapidAPI-Key' : process.env.X_RAPID_API_KEY,
                'X-RapidAPI-Host' : 'jsearch.p.rapidapi.com'
            }
        };

        const response = await axios.request(option)
        const jobs = response.data.data;

        if(!jobs || jobs.length === 0)
        {
            return res.status(200).json({
                message : "No new internship found from the API"
            })
        }

        const newInternship = []

        for(const job of jobs)
        {
            const exist = await internshipModel.findOne({applyLink : job.job_apply_link})

            if(!exist && job.job_apply_link)
            {
                const skillsFromAI = await extractSkillsWithGemini(job.job_description)
                
                newInternship.push({
                    title: job.job_title,
                    company: job.employer_name,
                    location: job.job_city || 'Remote',
                    stipend: 'Not Disclosed',
                    description: job.job_description ? job.job_description.substring(0, 400) + '...' : 'No description available.',
                    applyLink: job.job_apply_link,
                    requiredSkills: skillsFromAI,
                    source: 'JSearch API + Gemini'
                })
            }
        }

        if(newInternship.length > 0)
        {
            await internshipModel.insertMany(newInternship)
            console.log(`Added ${newInternship.length} new internships to the database.`);
            return res.status(201).json({ 
                message: `Added ${newInternship.length} new internships.` ,
                newInternship
            });
        }   

        else
        {
            console.log('Database is already up to date. No new internships to add.');
            return res.status(200).json({ message: 'Database is already up to date.' });
        }
    }

    catch(error)
    {
        console.error('Error fetching from JSearch API:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Failed to fetch internships from API.' });
    }
}

async function getAllInternships(req, res)
{
    try
    {
        const internships = await internshipModel.find({}).sort({ createdAt : -1 })
        return res.status(200).json({
            internships
        })
    }
    
    catch(error) 
    {
        console.error('Error fetching internships from DB:', error.message);
        res.status(500).json({ message: 'Failed to fetch internships from DB.' });
    }
}

async function searchInternships(req, res) {
    try {
        const { q } = req.query;
        
        if (!q || q.trim().length === 0) {
            return res.status(400).json({
                message: 'Search query is required',
                internships: []
            });
        }

        const searchQuery = q.trim();
        
        // Create search criteria using MongoDB text search and regex
        const searchCriteria = {
            $or: [
                { title: { $regex: searchQuery, $options: 'i' } },
                { company: { $regex: searchQuery, $options: 'i' } },
                { location: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } },
                { requiredSkills: { $elemMatch: { $regex: searchQuery, $options: 'i' } } }
            ]
        };

        const internships = await internshipModel.find(searchCriteria)
            .sort({ createdAt: -1 })
            .limit(50); // Limit results for performance

        return res.status(200).json({
            message: `Found ${internships.length} internships matching "${searchQuery}"`,
            internships,
            searchQuery
        });

    } catch (error) {
        console.error('Error searching internships:', error.message);
        res.status(500).json({ 
            message: 'Failed to search internships',
            internships: []
        });
    }
}

module.exports = {
    fetchAndSaveInternships,
    getAllInternships,
    searchInternships
}