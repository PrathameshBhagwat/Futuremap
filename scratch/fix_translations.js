const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../lib/offline-translations.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Fix hero section
content = content.replace(/ctaExplore:\s*'(.*?)',\s*ctaQuiz:\s*'(.*?)',\s*scrollDown:\s*'(.*?)'/g, 
  "ctaStart: '$2',\n    ctaLearn: '$1',\n    stats: {\n      studentsGuided: '10K+',\n      careerPaths: '50+',\n      collegesListed: '1000+'\n    }");

// Fix featureCards section
content = content.replace(/featureCards:\s*{([\s\S]*?)personalizedQuiz/g, 
  "featureCards: {\n    sectionTitle: 'Powerful Features',\n    sectionSubtitle: 'Discover the tools you need',\n    personalizedQuiz");

content = content.replace(/careerVisualization:\s*{([\s\S]*?)}/g, 
  "careerVisualization: {$1},\n    additionalFeatures: {\n      aiInsights: { title: 'AI Insights', description: 'Insights' },\n      studyMaterials: { title: 'Materials', description: 'Study' },\n      goalSetting: { title: 'Goals', description: 'Set goals' }\n    },\n    exploreAll: 'Explore All'");

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed offline-translations.ts');
