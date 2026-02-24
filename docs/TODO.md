# NDT Exchange - To-Do List & Feature Ideas

Here is a list of pending tasks and potential new features to enhance the platform.

## I. Core Features to Complete

These are features that are partially implemented or simulated and need to be fully built out to make the application production-ready.

1.  **Implement Real File Uploads:**
    - **Current State:** File uploads (e.g., for job documents, report attachments, company logos) are currently simulated.
    - **Next Step:** Integrate with Firebase Storage to handle actual file uploads, storage, and retrieval. This is a critical feature for the entire application.

2.  **Full Real-Time Chat:**
    - **Current State:** The main `/messages` page is functional, but the chat window within the Job Details page is a placeholder.
    - **Next Step:** Implement a real-time chat component on the job details page, allowing clients and providers to communicate directly in the context of a specific job.

3.  **User Invitation Workflow:**
    - **Current State:** Inviting a new user from the Admin dashboard is simulated.
    - **Next Step:** Integrate with Firebase Authentication to trigger a real password-setup email when a new user is invited.

## II. New Feature Ideas

These are new ideas that can significantly enhance the value of the platform for different user roles.

1.  **AI-Powered Report Analysis:**
    - **Concept:** When a provider submits an inspection report, use an AI model (via Genkit) to automatically summarize the findings, flag critical defects based on keywords (e.g., "severe corrosion," "crack"), and highlight discrepancies.
    - **Benefit:** This would drastically speed up the review process for Clients and Auditors, allowing them to focus on the most important information immediately.

2.  **AI-Assisted Job Scoping:**
    - **Concept:** When creating a new job, clients can use natural language to describe their needs (e.g., "I need to check for corrosion on the floor of a 10-meter diameter storage tank built in 2015"). An AI model (via Genkit) would analyze this input, suggest the most appropriate NDT techniques (like MFL for tank floors), identify relevant industry standards (like API 653), and pre-fill the job creation form.
    - **Benefit:** Lowers the barrier to entry for clients, speeds up job creation, and ensures postings are more accurate and complete from the start.

3.  **Smart Resource Suggestions:**
    - **Concept:** When an NDT Provider assigns resources to a newly awarded job, the system could intelligently suggest the best technicians and equipment.
    - **Logic:** Suggestions would be based on matching technician certifications to job requirements, checking team member availability on the calendar, and ensuring equipment is calibrated and available.
    - **Benefit:** Streamlines the operational workflow for providers, reducing manual effort and preventing scheduling conflicts.

4.  **Public Company Profiles:**
    - **Concept:** Create public-facing, shareable profile pages for Service Providers and Auditors. These pages would showcase their services, techniques, overall rating, and approved client reviews.
    - **Benefit:** Acts as a powerful marketing tool for providers, helps them win more business, and increases the platform's value as a central industry directory.

5.  **Interactive Digital Twin Viewer:**
    - **Concept:** For assets with 3D models (e.g., from CAD files), create a viewer where inspection data is mapped directly onto the model. Users could click on a specific location (like a weld seam) to see its full inspection history, view defect photos, and see wall thickness readings overlaid on the structure.
    - **Benefit:** Provides an incredibly intuitive way to visualize asset health, making it easier to understand the location and context of defects and plan repairs. This is a core part of the NDT 4.0 vision.
