require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/user.model');
const Application = require('./src/models/application.model');
const Internship = require('./src/models/internship.model');

async function createTestApplications() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('📶 Connected to MongoDB');

        // Find our test user
        const user = await User.findOne({ githubUsername: 'ujjwalprakashrc1122' });
        if (!user) {
            console.log('❌ Test user not found');
            return;
        }

        console.log(`👤 Found user: ${user.name} (${user._id})`);

        // Create some test internships first
        const sampleInternships = [
            {
                title: 'Frontend Developer Intern',
                company: 'TechCorp',
                location: 'Remote',
                type: 'Full-time',
                duration: '3 months',
                stipend: '15000',
                description: 'Work on React.js projects',
                requiredSkills: ['JavaScript', 'React', 'CSS'],
                applyLink: 'https://example.com/apply/1'
            },
            {
                title: 'Backend Developer Intern',
                company: 'DataSoft',
                location: 'Bangalore',
                type: 'Part-time',
                duration: '6 months',
                stipend: '20000',
                description: 'Node.js and MongoDB development',
                requiredSkills: ['JavaScript', 'Node.js', 'MongoDB'],
                applyLink: 'https://example.com/apply/2'
            },
            {
                title: 'Full Stack Developer Intern',
                company: 'InnovateLab',
                location: 'Mumbai',
                type: 'Full-time',
                duration: '4 months',
                stipend: '25000',
                description: 'MERN stack development',
                requiredSkills: ['JavaScript', 'React', 'Node.js'],
                applyLink: 'https://example.com/apply/3'
            }
        ];

        // Insert internships if they don't exist
        let internships = [];
        for (const internshipData of sampleInternships) {
            let internship = await Internship.findOne({ title: internshipData.title, company: internshipData.company });
            if (!internship) {
                internship = new Internship(internshipData);
                await internship.save();
                console.log(`✅ Created internship: ${internship.title} at ${internship.company}`);
            } else {
                console.log(`📝 Internship exists: ${internship.title} at ${internship.company}`);
            }
            internships.push(internship);
        }

        // Clear existing applications for this user
        await Application.deleteMany({ user: user._id });
        console.log('🧹 Cleared existing applications');

        // Create test applications with different statuses
        const testApplications = [
            {
                user: user._id,
                internship: internships[0]._id,
                status: 'viewed',
                source: 'dashboard'
            },
            {
                user: user._id,
                internship: internships[1]._id,
                status: 'applied',
                source: 'recommendations'
            },
            {
                user: user._id,
                internship: internships[2]._id,
                status: 'bookmarked',
                source: 'search'
            }
        ];

        for (const appData of testApplications) {
            const application = new Application(appData);
            await application.save();
            console.log(`✅ Created application: ${appData.status} for internship ${appData.internship}`);
        }

        // Display summary
        const stats = await Promise.all([
            Application.countDocuments({ user: user._id }),
            Application.countDocuments({ user: user._id, status: 'viewed' }),
            Application.countDocuments({ user: user._id, status: 'applied' }),
            Application.countDocuments({ user: user._id, status: 'bookmarked' })
        ]);

        console.log('\n📊 Test Applications Created:');
        console.log(`Total: ${stats[0]}`);
        console.log(`Viewed: ${stats[1]}`);
        console.log(`Applied: ${stats[2]}`);
        console.log(`Bookmarked: ${stats[3]}`);

        console.log('\n✅ Test applications setup completed!');
        console.log('Now the ApplicationStats component should display proper data.');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
        process.exit(0);
    }
}

createTestApplications();