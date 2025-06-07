# Developer Hub - Professional Community Platform

A modern professional community platform with robust user authentication and profile management.

## Features

DeveloperHub: Community-Driven Collaborative Platform for Developers
📌 Project Summary
DeveloperHub is a feature-rich, full-stack web application designed to empower developers by offering an all-in-one platform for collaboration, communication, project management, and knowledge sharing. The platform supports a hierarchical, community-based structure, facilitating everything from public Q&A to version-controlled code editing, video meetings, and task management—all within secure and scalable developer communities.
________________________________________
🧩 Core Functionalities
1. 🏘️ Community System
•	Create / Join Communities
•	Community Visibility Modes:
o	Public: Open to all users
o	Protected Public: Join requests require admin approval
o	Private: Hidden from listings; joinable only via invite link
•	Hierarchical Roles & Permissions:
o	Customizable role hierarchy (e.g., Owner > Admin > Maintainer > Member)
o	Role-based access to community features and communication channels
________________________________________
2. 👥 Subgroup System
•	Communities can create subgroups (e.g., “Frontend Team”, “Infra Team”)
•	Each subgroup has its own:
o	Dedicated chat
o	Task management panel
o	Video meeting room
o	Collaborative code editor
________________________________________
3. 💬 Chat System
•	Real-time messaging with Socket.IO
•	1-on-1 and group chats
•	Role-based Council Chat:
o	Only top members of each level can communicate in preceding higher-level channels
o	Enables structured discussion between subgroup leads, managers, and admins
________________________________________
4. ✅ Task & Project Management
•	Kanban-style task boards for each subgroup
•	Task assignment to individuals or entire groups
•	Tasks support:
o	Title, Description, Priority, Deadline, Comments
o	Status tracking: Todo → In Progress → Done
________________________________________
5. 🧑‍💻 Git-Based Collaborative Code Editor
•	Real-time collaboration using Monaco Editor + Yjs/Liveblocks
•	Key Features:
o	Version control system with branching support
o	Multiplayer editing with cursor presence and inline comments
o	Export code or sync with external GitHub repositories (optional future feature)
________________________________________
6. 🎥 Virtual Meeting Rooms
•	Built with WebRTC or third-party SDKs like Daily or Jitsi
•	Each community or subgroup can host:
o	Instant video calls
o	Scheduled meetings
o	Screen sharing & chat sidebar
________________________________________
7. 🌐 Public Developer Conversations
•	Q&A-style public discussion forum similar to Stack Overflow
•	Tag-based navigation
•	Voting and accepted answers to foster high-quality contributions
•	Moderation tools for community leads
________________________________________
🎯 Vision
To provide a unified, scalable, and intuitive platform that encourages developer collaboration, fosters community-led learning, and supports real-world software workflows like version control, task assignment, and structured team communication.


## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd developer-hub
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add the following environment variables:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/developer-hub

# JWT Configuration
JWT_ACCESS_SECRET=your_access_token_secret_here
JWT_REFRESH_SECRET=your_refresh_token_secret_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# File Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
```
## License

This project is licensed under the MIT License - see the LICENSE file for details.
