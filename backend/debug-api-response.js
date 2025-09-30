require('dotenv').config();
const axios = require('axios');

async function debugApiResponse() {
    try {
        const baseURL = 'https://internship-web-app-42i2.onrender.com/api';
        
        // JWT token for the test user
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGRiZDBjN2NmNjVlM2Y2NWY5ODUzNWQiLCJpYXQiOjE3NTkyMzYzMjMsImV4cCI6MTc1OTMyMjcyM30.DbvQeGb5l8bLzr63sOWB2XPKT0U5N_lc8wFk-ryfQ9I';
        
        console.log('🔍 Testing Applications API Response Structure...\n');
        
        // Test getUserApplications endpoint
        console.log('📊 Testing /api/applications/user-applications...');
        
        const applicationsResponse = await axios.get(`${baseURL}/applications/user-applications`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            params: {
                status: '',
                page: 1,
                limit: 1000
            }
        });
        
        console.log('✅ Applications Response Status:', applicationsResponse.status);
        console.log('📄 Applications Response Structure:', JSON.stringify(applicationsResponse.data, null, 2));
        
        // Check if data.total exists
        if (applicationsResponse.data?.data?.total !== undefined) {
            console.log('✅ data.total exists:', applicationsResponse.data.data.total);
        } else {
            console.log('❌ data.total is missing!');
            console.log('Available properties in data:', Object.keys(applicationsResponse.data?.data || {}));
        }
        
        // Test different status filters
        console.log('\n📊 Testing different status filters...');
        
        const statusTests = ['viewed', 'applied', 'bookmarked'];
        
        for (const status of statusTests) {
            try {
                const statusResponse = await axios.get(`${baseURL}/applications/user-applications`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    params: {
                        status: status,
                        page: 1,
                        limit: 1000
                    }
                });
                
                console.log(`✅ ${status.toUpperCase()} - Status: ${statusResponse.status}, Total: ${statusResponse.data?.data?.total || 'UNDEFINED'}`);
            } catch (error) {
                console.log(`❌ ${status.toUpperCase()} - Error: ${error.response?.status} ${error.response?.statusText}`);
            }
        }
        
    } catch (error) {
        console.error('❌ API Debug Error:', error.response?.data || error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
        }
    }
}

debugApiResponse();