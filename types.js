// Type definitions for the UPSC AI application
// These are JSDoc definitions used for documentation purposes

/**
 * @typedef {Object} NewsSource
 * @property {string} id
 * @property {string} name
 * @property {string} url
 * @property {'Newspaper' | 'Government' | 'Environment' | 'Economy'} category
 */

/**
 * @typedef {Object} NewsArticle
 * @property {string} id
 * @property {string} title
 * @property {string} source
 * @property {string} [url]
 * @property {string} summary
 * @property {string} publishedDate
 * @property {string} scrapedAt
 */

/**
 * @typedef {Object} MCQ
 * @property {string} question
 * @property {string[]} options
 * @property {number} correctOption - Index 0-3
 * @property {string} explanation
 */

/**
 * @typedef {Object} MainsQuestion
 * @property {string} question
 * @property {string[]} modelAnswerPoints
 */

/**
 * @typedef {Object} GeneratedNote
 * @property {string} _id - MongoDB style ID
 * @property {string} [userId] - Owner of the note
 * @property {string} [articleId]
 * @property {string} title
 * @property {string} source
 * @property {'GS1' | 'GS2' | 'GS3' | 'GS4' | 'Prelims' | 'Essay'} gsPaper
 * @property {string[]} tags
 * @property {string} summary
 * @property {string} content - Markdown formatted detailed notes
 * @property {MCQ[]} mcqs
 * @property {MainsQuestion} [mainsQuestion]
 * @property {string} createdAt
 */

/**
 * @typedef {Object} User
 * @property {string} _id
 * @property {string} name
 * @property {string} email
 */

/**
 * @typedef {Object} AuthState
 * @property {User | null} user
 * @property {string | null} token
 * @property {boolean} isAuthenticated
 */

/**
 * @typedef {'idle' | 'searching' | 'analyzing' | 'success' | 'error'} ProcessingStatus
 */

export default {};
