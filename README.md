![image](https://github.com/user-attachments/assets/75c946b2-5d74-45a7-a2f2-d78db7db4d35)

![image](https://github.com/user-attachments/assets/9d461b6d-04e3-426f-8fd8-1517676bace1)

![image](https://github.com/user-attachments/assets/351b4dc4-4585-4d64-b99e-69c2f14c0517)


# Next.js Application
Follow these steps to get started:

## Prerequisites

Ensure you have *Node.js* and *npm* installed on your machine. You can download them [here](https://nodejs.org/).

## Installation



1. *Clone the Repository*: Clone this repository to your local machine.

   ```bash
   git clone https://github.com/AnshTanwar/meeting-notes-main.git
   cd meeting-notes-main
   ```

2. *Install Dependencies*: Run the following command to install the project dependencies.

   ```bash
        npm install --legacy-peer-deps
   ```
   
   

3. *Set up environment variables*: Add the following key-value pair to the .env file:
   Create a .env file: In the root directory, create a new file named .env.
   ```bash
        ASSEMBLYAI_API_KEY=<your assembly api key>
   ```
   

   
3. *Start the Development Server*: Run the following command to start the development server.

   ```bash
        npm run dev
   ```

4. *Access the Application*: Open your web browser and navigate to [http://localhost:3000](http://localhost:3000).

## Usage

The application should be accessible at [http://localhost:3000](http://localhost:3000).


# Multi-Speaker Transcription Approach Using AssemblyAI

1. **Setup**: Initialize the AssemblyAI API and configure transcription settings with options like `speaker_labels`, `auto_highlights`, and `entity_detection`.

2. **Transcription**: Use `transcribe()` to process the audio and generate the transcript with speaker labels.

3. **Extract Speaker-Text Pairs**: Loop through the transcript’s utterances, store each speaker’s text in a list as `[Speaker n, text]`.

4. **Output**: The list of speaker-text pairs is ready for analysis.

---

# Meeting Analysis Process

This code utilizes multiple prompts to generate a structured analysis of meeting transcripts, including a summary, counterpoints, ideas, and action items. Below are the steps involved:

1. **Generate Meeting Summary**
   - **Objective**: Summarizes key outcomes, action items, and discussed steps from the meeting transcript.
   - **Input**: Meeting transcript (list of speaker-dialogue pairs).
   - **Output**: A JSON object containing the meeting outcomes, action items, and discussed steps.

2. **Extract Counterpoints and Ideas**
   - **Objective**: Identifies counterpoints and proposed ideas discussed but not adopted during the meeting.
   - **Input**: Meeting transcript (list of speaker-dialogue pairs).
   - **Output**: A JSON object containing counterpoints and proposed ideas.

3. **Assign Actions and Responsibilities**
   - **Objective**: Organizes action items from the meeting summary into structured tasks with responsibilities, deadlines, and importance levels.
   - **Input**: Meeting transcript (list of speaker-dialogue pairs) and action items (extracted from the meeting summary).
   - **Output**: A JSON array containing detailed task assignments (description, DRI, consulted individuals, importance, deadline).

4. **Main Function**
   - **Objective**: Calls the above functions sequentially to generate a comprehensive meeting analysis.
   - **Input**: Meeting transcript (list of speaker-dialogue pairs).
   - **Output**: A dictionary containing the meeting summary, counterpoints and ideas, and action items with responsibilities.

---

# Model Interactions

- Each function interacts with the generative model (`gemini-1.5-pro-latest`) to produce content based on the specified inputs.
- The model configurations, such as `temperature` and `top_p`, are adjusted for each task to control the output.

---


# Example Usage

```python
analyze_meeting(meeting_transcript_list)
```





