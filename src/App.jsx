
import React, { useState, useEffect } from 'react';

// Centralized ROLES configuration for strict RBAC
const ROLES = {
    ADMIN: 'ADMIN',             // HR, Culture Architect - Full access, survey creation, anonymity, department mapping, audit logs
    EXECUTIVE: 'EXECUTIVE',     // Strategic Planner - High-level heatmaps, trends, ROI, view only
    MANAGER: 'MANAGER',         // Team Lead - Team-specific sentiment, action plans, approve/reject feedback
    EMPLOYEE: 'EMPLOYEE',       // The Contributor - Pulse surveys, recognition, anonymous feedback
};

// Standardized status keys and UI labels
const STATUS_MAP = {
    DRAFT: 'Draft',
    ACTIVE: 'Active',
    PAUSED: 'Paused',
    COMPLETED: 'Completed',
    ARCHIVED: 'Archived',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    PENDING: 'Pending Review',
    SUBMITTED: 'Submitted',
    ACTION_REQUIRED: 'Action Required',
};

// Deterministic status colors
const STATUS_COLORS = {
    DRAFT: 'status-draft',
    ACTIVE: 'status-active',
    PAUSED: 'status-paused',
    COMPLETED: 'status-completed',
    ARCHIVED: 'status-archived',
    APPROVED: 'status-approved',
    REJECTED: 'status-rejected',
    PENDING: 'status-pending',
    SUBMITTED: 'status-submitted',
    ACTION_REQUIRED: 'status-rejected', // Using rejected color for action required
};

// --- DUMMY DATA ---
const dummyUsers = [
    { id: 'user1', name: 'Alice Admin', email: 'alice@pulse.com', role: ROLES.ADMIN, departmentId: 'dep1' },
    { id: 'user2', name: 'Bob Executive', email: 'bob@pulse.com', role: ROLES.EXECUTIVE, departmentId: 'dep1' },
    { id: 'user3', name: 'Charlie Manager', email: 'charlie@pulse.com', role: ROLES.MANAGER, departmentId: 'dep2' },
    { id: 'user4', name: 'Diana Employee', email: 'diana@pulse.com', role: ROLES.EMPLOYEE, departmentId: 'dep2' },
    { id: 'user5', name: 'Eve Employee', email: 'eve@pulse.com', role: ROLES.EMPLOYEE, departmentId: 'dep3' },
    { id: 'user6', name: 'Frank Employee', email: 'frank@pulse.com', role: ROLES.EMPLOYEE, departmentId: 'dep1' },
    { id: 'user7', name: 'Grace Manager', email: 'grace@pulse.com', role: ROLES.MANAGER, departmentId: 'dep1' },
];

const dummyDepartments = [
    { id: 'dep1', name: 'Engineering' },
    { id: 'dep2', name: 'Marketing' },
    { id: 'dep3', name: 'Sales' },
    { id: 'dep4', name: 'Human Resources' },
];

const dummySurveys = [
    {
        id: 'survey1',
        title: 'Weekly Pulse Check - Team Morale',
        description: 'A quick check on team morale and well-being this week.',
        status: 'ACTIVE',
        creationDate: '2023-10-20',
        departmentId: 'dep2',
        creatorId: 'user1',
        questions: [{ text: 'How do you feel about your workload this week?', type: 'rating' }, { text: 'Any blockers?', type: 'text' }],
        workflow: ['DRAFT', 'PENDING', 'ACTIVE', 'COMPLETED'],
        currentWorkflowStage: 'ACTIVE',
        slaStatus: 'ON_TRACK',
    },
    {
        id: 'survey2',
        title: 'Q4 Employee Satisfaction Survey',
        description: 'Comprehensive survey to gauge overall employee satisfaction for Q4.',
        status: 'DRAFT',
        creationDate: '2023-10-15',
        departmentId: 'dep1',
        creatorId: 'user1',
        questions: [{ text: 'Are you satisfied with your growth opportunities?', type: 'rating' }],
        workflow: ['DRAFT', 'PENDING', 'ACTIVE', 'COMPLETED', 'ARCHIVED'],
        currentWorkflowStage: 'DRAFT',
        slaStatus: 'AT_RISK',
    },
    {
        id: 'survey3',
        title: 'New Feature Feedback - Project X',
        description: 'Gathering feedback on the recently launched Project X features.',
        status: 'COMPLETED',
        creationDate: '2023-09-01',
        departmentId: 'dep1',
        creatorId: 'user7',
        questions: [{ text: 'How intuitive is the new feature?', type: 'rating' }],
        workflow: ['DRAFT', 'PENDING', 'ACTIVE', 'COMPLETED'],
        currentWorkflowStage: 'COMPLETED',
        slaStatus: 'COMPLETED',
    },
    {
        id: 'survey4',
        title: 'Burnout Prevention Check-in',
        description: 'Proactive check-in to identify signs of burnout across departments.',
        status: 'ACTIVE',
        creationDate: '2023-11-01',
        departmentId: 'dep4',
        creatorId: 'user1',
        questions: [{ text: 'Do you feel you have a healthy work-life balance?', type: 'rating' }],
        workflow: ['DRAFT', 'PENDING', 'ACTIVE', 'COMPLETED'],
        currentWorkflowStage: 'ACTIVE',
        slaStatus: 'ON_TRACK',
    },
    {
        id: 'survey5',
        title: 'Diversity & Inclusion Pulse',
        description: 'Quick poll on D&I initiatives awareness and effectiveness.',
        status: 'PAUSED',
        creationDate: '2023-10-25',
        departmentId: 'dep4',
        creatorId: 'user1',
        questions: [{ text: 'Do you feel a sense of belonging at PulsePoint?', type: 'rating' }],
        workflow: ['DRAFT', 'PENDING', 'ACTIVE', 'COMPLETED'],
        currentWorkflowStage: 'PAUSED',
        slaStatus: 'BREACHED',
    },
];

const dummyFeedback = [
    {
        id: 'feedback1',
        surveyId: 'survey1',
        employeeId: 'user4',
        sentiment: 'Positive',
        text: 'The workload was manageable and I felt productive.',
        submissionDate: '2023-10-23',
        status: 'APPROVED',
    },
    {
        id: 'feedback2',
        surveyId: 'survey1',
        employeeId: 'user5',
        sentiment: 'Negative',
        text: 'Feeling overwhelmed with conflicting priorities this week.',
        submissionDate: '2023-10-23',
        status: 'PENDING',
    },
    {
        id: 'feedback3',
        surveyId: 'survey3',
        employeeId: 'user6',
        sentiment: 'Neutral',
        text: 'The new feature is functional, but the UI could be more intuitive.',
        submissionDate: '2023-09-05',
        status: 'COMPLETED',
    },
    {
        id: 'feedback4',
        surveyId: 'survey2',
        employeeId: 'user4',
        sentiment: 'Positive',
        text: 'Excited about the growth opportunities, team is supportive.',
        submissionDate: '2023-10-25',
        status: 'SUBMITTED',
    },
    {
        id: 'feedback5',
        surveyId: 'survey4',
        employeeId: 'user5',
        sentiment: 'Negative',
        text: 'Finding it hard to disconnect after work, constantly thinking about tasks.',
        submissionDate: '2023-11-03',
        status: 'ACTION_REQUIRED',
    },
];

const dummyRecognition = [
    {
        id: 'rec1',
        recipientId: 'user4',
        giverId: 'user3',
        message: 'Great job leading the Q4 campaign, Diana!',
        date: '2023-10-25',
        status: 'APPROVED',
    },
    {
        id: 'rec2',
        recipientId: 'user6',
        giverId: 'user5',
        message: 'Thanks for helping me with the Project X deployment, Frank!',
        date: '2023-10-20',
        status: 'PENDING',
    },
    {
        id: 'rec3',
        recipientId: 'user3',
        giverId: 'user1',
        message: 'Charlie, your initiative in team building is highly appreciated.',
        date: '2023-11-01',
        status: 'APPROVED',
    },
];

const dummyAuditLogs = [
    { id: 'log1', userId: 'user1', action: 'Survey created: survey2', entityType: 'SURVEY', entityId: 'survey2', timestamp: '2023-10-15T10:00:00Z' },
    { id: 'log2', userId: 'user3', action: 'Feedback status changed to PENDING: feedback2', entityType: 'FEEDBACK', entityId: 'feedback2', timestamp: '2023-10-23T14:30:00Z' },
    { id: 'log3', userId: 'user1', action: 'Survey status changed to ACTIVE: survey1', entityType: 'SURVEY', entityId: 'survey1', timestamp: '2023-10-20T09:00:00Z' },
    { id: 'log4', userId: 'user4', action: 'Feedback submitted: feedback4', entityType: 'FEEDBACK', entityId: 'feedback4', timestamp: '2023-10-25T11:00:00Z' },
    { id: 'log5', userId: 'user7', action: 'Survey status changed to COMPLETED: survey3', entityType: 'SURVEY', entityId: 'survey3', timestamp: '2023-09-10T16:00:00Z' },
];

const findUser = (id) => dummyUsers.find(u => u.id === id);
const findDepartment = (id) => dummyDepartments.find(d => d.id === id);

function App() {
    const [view, setView] = useState({ screen: 'LOGIN', params: {} });
    const [currentUser, setCurrentUser] = useState(null);
    const [surveys, setSurveys] = useState(dummySurveys);
    const [feedback, setFeedback] = useState(dummyFeedback);
    const [recognition, setRecognition] = useState(dummyRecognition);
    const [auditLogs, setAuditLogs] = useState(dummyAuditLogs);

    // Global navigation handler
    const navigate = (screen, params = {}) => {
        setView(prevView => ({ ...prevView, screen, params }));
    };

    const login = (role) => {
        let user;
        switch (role) {
            case ROLES.ADMIN: user = findUser('user1'); break;
            case ROLES.EXECUTIVE: user = findUser('user2'); break;
            case ROLES.MANAGER: user = findUser('user3'); break;
            case ROLES.EMPLOYEE: user = findUser('user4'); break;
            default: user = findUser('user4'); // Default to employee
        }
        setCurrentUser(user);
        navigate('DASHBOARD');
    };

    const logout = () => {
        setCurrentUser(null);
        navigate('LOGIN');
    };

    // Helper to get breadcrumbs based on current view
    const getBreadcrumbs = () => {
        const crumbs = [{ label: 'Dashboard', screen: 'DASHBOARD' }];
        switch (view.screen) {
            case 'DASHBOARD':
                return [{ label: 'Dashboard', screen: 'DASHBOARD' }];
            case 'SURVEY_LIST':
                crumbs.push({ label: 'Surveys', screen: 'SURVEY_LIST' });
                break;
            case 'SURVEY_DETAIL':
                crumbs.push({ label: 'Surveys', screen: 'SURVEY_LIST' });
                const survey = surveys.find(s => s.id === view.params?.id);
                if (survey) crumbs.push({ label: survey.title, screen: 'SURVEY_DETAIL', params: { id: survey.id } });
                break;
            case 'SURVEY_FORM':
                crumbs.push({ label: 'Surveys', screen: 'SURVEY_LIST' });
                crumbs.push({ label: view.params?.mode === 'create' ? 'Create Survey' : 'Edit Survey', screen: view.screen, params: view.params });
                break;
            case 'FEEDBACK_LIST':
                crumbs.push({ label: 'Feedback', screen: 'FEEDBACK_LIST' });
                break;
            case 'FEEDBACK_DETAIL':
                crumbs.push({ label: 'Feedback', screen: 'FEEDBACK_LIST' });
                const fb = feedback.find(f => f.id === view.params?.id);
                if (fb) crumbs.push({ label: `Feedback for ${surveys.find(s => s.id === fb.surveyId)?.title || 'Survey'}`, screen: 'FEEDBACK_DETAIL', params: { id: fb.id } });
                break;
            case 'RECOGNITION_LIST':
                crumbs.push({ label: 'Recognition', screen: 'RECOGNITION_LIST' });
                break;
            case 'RECOGNITION_DETAIL':
                crumbs.push({ label: 'Recognition', screen: 'RECOGNITION_LIST' });
                const rec = recognition.find(r => r.id === view.params?.id);
                if (rec) crumbs.push({ label: `Recognition for ${findUser(rec.recipientId)?.name}`, screen: 'RECOGNITION_DETAIL', params: { id: rec.id } });
                break;
            case 'AUDIT_LOGS':
                crumbs.push({ label: 'Audit Logs', screen: 'AUDIT_LOGS' });
                break;
            case 'USER_PROFILE':
                crumbs.push({ label: 'Profile', screen: 'USER_PROFILE' });
                break;
            default:
                break;
        }
        return crumbs;
    };

    // --- Component Definitions (nested for single-file output as per instructions) ---

    const Header = ({ user, breadcrumbs, onLogout, onNavigate }) => (
        <header className="app-header">
            <div className="flex-row align-center">
                <div className="app-logo" onClick={() => onNavigate('DASHBOARD')} style={{ cursor: 'pointer' }}>PulsePoint</div>
                <div className="breadcrumbs">
                    {breadcrumbs.map((crumb, index) => (
                        <React.Fragment key={crumb.label}>
                            <span className="breadcrumb-item">
                                <a onClick={() => onNavigate(crumb.screen, crumb.params)} style={{ cursor: 'pointer' }}>
                                    {crumb.label}
                                </a>
                            </span>
                            {(index < breadcrumbs.length - 1) && <span className="breadcrumb-separator">/</span>}
                        </React.Fragment>
                    ))}
                </div>
            </div>
            <div className="flex-row align-center">
                <input type="text" placeholder="Global search..." className="global-search-input" />
                {user && (
                    <div className="user-info ml-lg" onClick={() => onNavigate('USER_PROFILE')}>
                        <span className="user-avatar">{user.name.charAt(0)}</span>
                        <span>{user.name} ({STATUS_MAP[user.role] || user.role})</span>
                    </div>
                )}
                {user && (
                    <button className="button button-secondary ml-md" onClick={onLogout}>
                        Logout
                    </button>
                )}
            </div>
        </header>
    );

    const Card = ({ title, subtitle, content, status, onClick, footer, isNew = false }) => (
        <div className={`card ${STATUS_COLORS[status] || ''} ${isNew ? 'pulse-animation' : ''}`} onClick={onClick} style={{ marginBottom: 'var(--spacing-md)' }}>
            <h3 className="card-title">{title}</h3>
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
            <p className="card-text">{content}</p>
            <div className="card-footer">
                {footer}
                <span className={`status-badge ${STATUS_COLORS[status] || ''}`}>{STATUS_MAP[status] || status}</span>
            </div>
        </div>
    );

    const LoginScreen = ({ onLogin }) => (
        <div className="flex-col flex-center" style={{ minHeight: '100vh', backgroundColor: 'var(--color-primary-light)' }}>
            <div className="card" style={{ padding: 'var(--spacing-xl)', textAlign: 'center', width: '350px' }}>
                <h2 style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-primary)' }}>PulsePoint Login</h2>
                <p style={{ marginBottom: 'var(--spacing-lg)' }}>Select a role to log in:</p>
                <div className="flex-col" style={{ gap: 'var(--spacing-md)' }}>
                    <button className="button button-primary" onClick={() => onLogin(ROLES.ADMIN)}>Login as Admin (HR)</button>
                    <button className="button button-primary" onClick={() => onLogin(ROLES.EXECUTIVE)}>Login as Executive</button>
                    <button className="button button-primary" onClick={() => onLogin(ROLES.MANAGER)}>Login as Manager</button>
                    <button className="button button-primary" onClick={() => onLogin(ROLES.EMPLOYEE)}>Login as Employee</button>
                </div>
            </div>
        </div>
    );

    const Dashboard = ({ currentUser, onNavigate }) => {
        const userSurveys = surveys.filter(s => (
            currentUser.role === ROLES.EMPLOYEE && s.departmentId === currentUser.departmentId && s.status === 'ACTIVE'
        ) || (
            currentUser.role === ROLES.MANAGER && s.departmentId === currentUser.departmentId
        ) || (
            currentUser.role === ROLES.ADMIN || currentUser.role === ROLES.EXECUTIVE
        ));

        const userFeedback = feedback.filter(f => (
            currentUser.role === ROLES.EMPLOYEE && f.employeeId === currentUser.id
        ) || (
            currentUser.role === ROLES.MANAGER && surveys.find(s => s.id === f.surveyId)?.departmentId === currentUser.departmentId
        ) || (
            currentUser.role === ROLES.ADMIN
        ));

        const userRecognition = recognition.filter(r => (
            r.recipientId === currentUser.id || r.giverId === currentUser.id
        ) || (
            currentUser.role === ROLES.ADMIN || currentUser.role === ROLES.EXECUTIVE
        ));


        const renderCards = (items, type) => (
            <div className="grid grid-cols-3">
                {items.slice(0, 3).map(item => {
                    let title, subtitle, content, status, onClick;
                    switch (type) {
                        case 'survey':
                            title = item.title;
                            subtitle = `Created by ${findUser(item.creatorId)?.name}`;
                            content = item.description;
                            status = item.status;
                            onClick = () => onNavigate('SURVEY_DETAIL', { id: item.id });
                            break;
                        case 'feedback':
                            title = `Feedback for ${surveys.find(s => s.id === item.surveyId)?.title || 'Unknown Survey'}`;
                            subtitle = `From ${findUser(item.employeeId)?.name}`;
                            content = item.text;
                            status = item.status;
                            onClick = () => onNavigate('FEEDBACK_DETAIL', { id: item.id });
                            break;
                        case 'recognition':
                            title = `Recognition for ${findUser(item.recipientId)?.name}`;
                            subtitle = `From ${findUser(item.giverId)?.name}`;
                            content = item.message;
                            status = item.status; // Recognition might have an approval status
                            onClick = () => onNavigate('RECOGNITION_DETAIL', { id: item.id });
                            break;
                        default:
                            return null;
                    }
                    return (
                        <Card
                            key={item.id}
                            title={title}
                            subtitle={subtitle}
                            content={content}
                            status={status}
                            onClick={onClick}
                            footer={null}
                            isNew={item.status === 'ACTIVE' || item.status === 'PENDING' || item.status === 'ACTION_REQUIRED'}
                        />
                    );
                })}
            </div>
        );

        return (
            <div className="page-content container">
                <h1>Welcome, {currentUser?.name}!</h1>

                {(currentUser.role === ROLES.ADMIN || currentUser.role === ROLES.EXECUTIVE) && (
                    <div className="detail-section">
                        <h2 className="detail-section-title">Strategic Insights</h2>
                        <div className="grid grid-cols-2">
                            <div className="chart-placeholder">Overall Sentiment (Gauge) <span className="pulse-animation" style={{ marginLeft: 'var(--spacing-sm)' }}>⚪</span></div>
                            <div className="chart-placeholder">Turnover Risk Trend (Line) <span className="pulse-animation" style={{ marginLeft: 'var(--spacing-sm)' }}>⚪</span></div>
                            <div className="chart-placeholder">Departmental Scores (Bar) <span className="pulse-animation" style={{ marginLeft: 'var(--spacing-sm)' }}>⚪</span></div>
                            <div className="chart-placeholder">ROI of Engagement (Donut) <span className="pulse-animation" style={{ marginLeft: 'var(--spacing-sm)' }}>⚪</span></div>
                        </div>
                        <div className="flex-end mt-md">
                            <button className="button button-secondary" style={{ marginRight: 'var(--spacing-md)' }}>Export Dashboards</button>
                            <button className="button button-primary" onClick={() => alert('Refreshing live data...')}>Live Refresh</button>
                        </div>
                    </div>
                )}

                {(currentUser.role === ROLES.ADMIN || currentUser.role === ROLES.MANAGER || currentUser.role === ROLES.EMPLOYEE) && (
                    <div className="detail-section">
                        <h2 className="detail-section-title flex-between align-center">
                            Your Active Surveys
                            <button className="button button-primary" onClick={() => onNavigate('SURVEY_LIST')}>View All Surveys</button>
                        </h2>
                        {(userSurveys.length === 0) ? (
                            <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-lg)', backgroundColor: 'var(--color-background-mid)' }}>
                                <p style={{ marginBottom: 'var(--spacing-md)' }}>No active surveys for your role/department.</p>
                                {(currentUser.role === ROLES.ADMIN) && (
                                    <button className="button button-primary" onClick={() => onNavigate('SURVEY_FORM', { mode: 'create' })}>Create New Survey</button>
                                )}
                            </div>
                        ) : (
                            renderCards(userSurveys, 'survey')
                        )}
                    </div>
                )}

                {(currentUser.role === ROLES.ADMIN || currentUser.role === ROLES.MANAGER || currentUser.role === ROLES.EMPLOYEE) && (
                    <div className="detail-section">
                        <h2 className="detail-section-title flex-between align-center">
                            Recent Feedback
                            <button className="button button-primary" onClick={() => onNavigate('FEEDBACK_LIST')}>View All Feedback</button>
                        </h2>
                        {(userFeedback.length === 0) ? (
                            <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-lg)', backgroundColor: 'var(--color-background-mid)' }}>
                                <p style={{ marginBottom: 'var(--spacing-md)' }}>No recent feedback to display.</p>
                                {(currentUser.role === ROLES.EMPLOYEE) && (
                                    <button className="button button-primary" onClick={() => onNavigate('SURVEY_LIST', { status: 'ACTIVE' })}>Take a Survey</button>
                                )}
                            </div>
                        ) : (
                            renderCards(userFeedback, 'feedback')
                        )}
                    </div>
                )}

                {(currentUser.role === ROLES.ADMIN || currentUser.role === ROLES.MANAGER || currentUser.role === ROLES.EMPLOYEE) && (
                    <div className="detail-section">
                        <h2 className="detail-section-title flex-between align-center">
                            Recent Recognition
                            <button className="button button-primary" onClick={() => onNavigate('RECOGNITION_LIST')}>View All Recognition</button>
                        </h2>
                        {(userRecognition.length === 0) ? (
                            <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-lg)', backgroundColor: 'var(--color-background-mid)' }}>
                                <p style={{ marginBottom: 'var(--spacing-md)' }}>No recent recognition to display.</p>
                                {(currentUser.role === ROLES.EMPLOYEE) && (
                                    <button className="button button-primary" onClick={() => alert('Sending Recognition (feature not implemented)')}>Give Recognition</button>
                                )}
                            </div>
                        ) : (
                            renderCards(userRecognition, 'recognition')
                        )}
                    </div>
                )}

                {(currentUser.role === ROLES.ADMIN) && (
                    <div className="detail-section">
                        <h2 className="detail-section-title flex-between align-center">
                            Admin Actions
                            <button className="button button-primary" onClick={() => onNavigate('AUDIT_LOGS')}>View Audit Logs</button>
                        </h2>
                        <div className="grid grid-cols-2">
                            <Card
                                title="Manage Users & Roles"
                                subtitle="Review and modify user access permissions."
                                content="Ensure correct RBAC and field-level security."
                                status="INFO"
                                onClick={() => alert('Manage Users (Feature coming soon)')}
                                footer={<span style={{ color: 'var(--color-primary)' }}>Admin Task</span>}
                            />
                             <Card
                                title="System Configuration"
                                subtitle="Configure global settings and anonymity."
                                content="Update SLA rules, session timeouts, and data encryption."
                                status="INFO"
                                onClick={() => alert('System Configuration (Feature coming soon)')}
                                footer={<span style={{ color: 'var(--color-primary)' }}>Admin Task</span>}
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const SurveyList = ({ currentUser, onNavigate }) => {
        const filteredSurveys = surveys.filter(s => {
            if (currentUser.role === ROLES.EMPLOYEE) {
                return s.departmentId === currentUser.departmentId && s.status === 'ACTIVE';
            }
            if (currentUser.role === ROLES.MANAGER) {
                return s.departmentId === currentUser.departmentId || s.creatorId === currentUser.id;
            }
            return true; // Admin/Executive see all
        });

        return (
            <div className="page-content container">
                <h1 style={{ marginBottom: 'var(--spacing-lg)' }}>All Surveys</h1>
                {(currentUser.role === ROLES.ADMIN || currentUser.role === ROLES.MANAGER) && (
                    <div className="flex-end mb-md">
                        <button className="button button-primary" onClick={() => onNavigate('SURVEY_FORM', { mode: 'create' })}>
                            Create New Survey
                        </button>
                    </div>
                )}
                <div className="grid grid-cols-3">
                    {(filteredSurveys.length === 0) ? (
                        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-lg)', backgroundColor: 'var(--color-background-mid)', gridColumn: '1 / -1' }}>
                            <p style={{ marginBottom: 'var(--spacing-md)' }}>No surveys found for your criteria.</p>
                        </div>
                    ) : (
                        filteredSurveys.map(survey => (
                            <Card
                                key={survey.id}
                                title={survey.title}
                                subtitle={`Created: ${survey.creationDate}`}
                                content={survey.description}
                                status={survey.status}
                                onClick={() => onNavigate('SURVEY_DETAIL', { id: survey.id })}
                                footer={<span>Department: {findDepartment(survey.departmentId)?.name}</span>}
                            />
                        ))
                    )}
                </div>
            </div>
        );
    };

    const SurveyDetail = ({ currentUser, surveyId, onNavigate, setSurveys }) => {
        const survey = surveys.find(s => s.id === surveyId);

        const handleUpdateStatus = (newStatus) => {
            if (!survey) return;
            setSurveys(prevSurveys =>
                prevSurveys.map(s =>
                    s.id === surveyId ? { ...s, status: newStatus, currentWorkflowStage: newStatus } : s
                )
            );
            // Add to audit logs
            setAuditLogs(prevLogs => [...prevLogs, {
                id: `log${prevLogs.length + 1}`,
                userId: currentUser?.id,
                action: `Survey ${survey?.title} status changed to ${newStatus}`,
                entityType: 'SURVEY',
                entityId: surveyId,
                timestamp: new Date().toISOString(),
            }]);
        };

        if (!survey) {
            return (
                <div className="page-content container">
                    <div className="card p-lg" style={{ textAlign: 'center' }}>
                        <h2>Survey Not Found</h2>
                        <button className="button button-primary mt-md" onClick={() => onNavigate('SURVEY_LIST')}>Back to Surveys</button>
                    </div>
                </div>
            );
        }

        const surveyFeedback = feedback.filter(f => f.surveyId === survey.id);
        const canEdit = (currentUser.role === ROLES.ADMIN || (currentUser.role === ROLES.MANAGER && survey.creatorId === currentUser.id));
        const canChangeStatus = (currentUser.role === ROLES.ADMIN || (currentUser.role === ROLES.MANAGER && survey.departmentId === currentUser.departmentId));

        const workflowStages = survey.workflow.map((stage, index) => {
            const currentStageIndex = survey.workflow.indexOf(survey.currentWorkflowStage);
            let stageClass = '';
            if (index < currentStageIndex) stageClass = 'completed';
            else if (index === currentStageIndex) stageClass = 'active';
            return { name: STATUS_MAP[stage], class: stageClass };
        });

        return (
            <div className="page-content container">
                <div className="detail-view">
                    <div className="detail-header">
                        <div>
                            <h1>{survey.title}</h1>
                            <p style={{ color: 'var(--color-text-dark)', fontSize: 'var(--font-size-lg)' }}>{survey.description}</p>
                            <div className="mt-md flex-row align-center" style={{ gap: 'var(--spacing-md)' }}>
                                <span className={`status-badge ${STATUS_COLORS[survey.status]}`}>{STATUS_MAP[survey.status]}</span>
                                {(survey.slaStatus === 'BREACHED') && (
                                    <span className="status-badge status-rejected">SLA BREACHED</span>
                                )}
                                {(survey.slaStatus === 'AT_RISK') && (
                                    <span className="status-badge status-pending">SLA AT RISK</span>
                                )}
                            </div>
                        </div>
                        <div className="flex-row" style={{ gap: 'var(--spacing-md)' }}>
                            {canEdit && (
                                <button className="button button-secondary" onClick={() => onNavigate('SURVEY_FORM', { mode: 'edit', id: survey.id })}>
                                    Edit Survey
                                </button>
                            )}
                            {canChangeStatus && survey.status !== 'ARCHIVED' && (
                                <select
                                    className="button button-primary"
                                    value={survey.status}
                                    onChange={(e) => handleUpdateStatus(e.target.value)}
                                    style={{ paddingRight: 'var(--spacing-lg)' }} // Ensure space for dropdown arrow
                                >
                                    {Object.keys(STATUS_MAP).map(key => (
                                        <option key={key} value={key} disabled={!survey.workflow.includes(key)}>
                                            {STATUS_MAP[key]}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    <div className="workflow-tracker">
                        {workflowStages.map((stage, index) => (
                            <div key={stage.name} className={`workflow-stage ${stage.class}`}>
                                <div className="workflow-stage-dot"></div>
                                <span className="workflow-stage-name">{stage.name}</span>
                                {(index < workflowStages.length - 1) && <div className="workflow-stage-line"></div>}
                            </div>
                        ))}
                    </div>

                    <div className="detail-section">
                        <h2 className="detail-section-title">Survey Details</h2>
                        <div className="detail-row"><span className="detail-label">Creator:</span> <span className="detail-value">{findUser(survey.creatorId)?.name}</span></div>
                        <div className="detail-row"><span className="detail-label">Department:</span> <span className="detail-value">{findDepartment(survey.departmentId)?.name}</span></div>
                        <div className="detail-row"><span className="detail-label">Created On:</span> <span className="detail-value">{survey.creationDate}</span></div>
                        <div className="detail-row"><span className="detail-label">Questions:</span> <span className="detail-value">
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {survey.questions.map((q, index) => (
                                    <li key={index} style={{ marginBottom: 'var(--spacing-xs)' }}>
                                        {index + 1}. {q.text} (Type: {q.type})
                                    </li>
                                ))}
                            </ul>
                        </span></div>
                    </div>

                    <div className="detail-section">
                        <h2 className="detail-section-title">Related Feedback ({surveyFeedback.length})</h2>
                        {(surveyFeedback.length === 0) ? (
                            <p style={{ color: 'var(--color-text-dark)' }}>No feedback submitted for this survey yet.</p>
                        ) : (
                            <div className="grid grid-cols-2">
                                {surveyFeedback.map(fb => (
                                    <Card
                                        key={fb.id}
                                        title={`Feedback from ${findUser(fb.employeeId)?.name}`}
                                        subtitle={`Submitted: ${fb.submissionDate}`}
                                        content={fb.text}
                                        status={fb.status}
                                        onClick={() => onNavigate('FEEDBACK_DETAIL', { id: fb.id })}
                                        footer={<span>Sentiment: {fb.sentiment}</span>}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const SurveyForm = ({ currentUser, surveyId, mode, onNavigate, setSurveys }) => {
        const isEdit = mode === 'edit';
        const initialSurvey = isEdit ? surveys.find(s => s.id === surveyId) : null;

        const [formData, setFormData] = useState({
            title: initialSurvey?.title || '',
            description: initialSurvey?.description || '',
            departmentId: initialSurvey?.departmentId || (currentUser?.role === ROLES.MANAGER ? currentUser.departmentId : ''),
            status: initialSurvey?.status || 'DRAFT',
            questions: initialSurvey?.questions || [{ text: '', type: 'rating' }],
        });
        const [errors, setErrors] = useState({});

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
            if (errors[name]) setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        };

        const handleQuestionChange = (index, e) => {
            const { name, value } = e.target;
            setFormData(prev => ({
                ...prev,
                questions: prev.questions.map((q, i) => i === index ? { ...q, [name]: value } : q)
            }));
        };

        const addQuestion = () => {
            setFormData(prev => ({ ...prev, questions: [...prev.questions, { text: '', type: 'rating' }] }));
        };

        const removeQuestion = (index) => {
            setFormData(prev => ({ ...prev, questions: prev.questions.filter((_, i) => i !== index) }));
        };

        const validateForm = () => {
            const newErrors = {};
            if (!formData.title.trim()) newErrors.title = 'Title is mandatory.';
            if (!formData.description.trim()) newErrors.description = 'Description is mandatory.';
            if (!formData.departmentId) newErrors.departmentId = 'Department is mandatory.';
            if (formData.questions.some(q => !q.text.trim())) newErrors.questions = 'All questions must have text.';
            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            if (!validateForm()) return;

            const now = new Date().toISOString().split('T')[0];
            if (isEdit) {
                setSurveys(prevSurveys =>
                    prevSurveys.map(s => (s.id === initialSurvey.id ? { ...s, ...formData } : s))
                );
                setAuditLogs(prevLogs => [...prevLogs, {
                    id: `log${prevLogs.length + 1}`,
                    userId: currentUser?.id,
                    action: `Survey updated: ${formData.title}`,
                    entityType: 'SURVEY',
                    entityId: initialSurvey.id,
                    timestamp: new Date().toISOString(),
                }]);
                onNavigate('SURVEY_DETAIL', { id: initialSurvey.id });
            } else {
                const newSurvey = {
                    id: `survey${surveys.length + 1}`,
                    ...formData,
                    creatorId: currentUser?.id,
                    creationDate: now,
                    workflow: ['DRAFT', 'PENDING', 'ACTIVE', 'COMPLETED'],
                    currentWorkflowStage: 'DRAFT',
                    slaStatus: 'ON_TRACK',
                };
                setSurveys(prevSurveys => [...prevSurveys, newSurvey]);
                setAuditLogs(prevLogs => [...prevLogs, {
                    id: `log${prevLogs.length + 1}`,
                    userId: currentUser?.id,
                    action: `Survey created: ${newSurvey.title}`,
                    entityType: 'SURVEY',
                    entityId: newSurvey.id,
                    timestamp: new Date().toISOString(),
                }]);
                onNavigate('SURVEY_LIST'); // Or to the detail of the newly created survey
            }
        };

        if (!(currentUser.role === ROLES.ADMIN || currentUser.role === ROLES.MANAGER)) {
            return (
                <div className="page-content container">
                    <div className="card p-lg" style={{ textAlign: 'center' }}>
                        <h2>Access Denied</h2>
                        <p>You do not have permission to {isEdit ? 'edit' : 'create'} surveys.</p>
                        <button className="button button-primary mt-md" onClick={() => onNavigate('DASHBOARD')}>Back to Dashboard</button>
                    </div>
                </div>
            );
        }

        return (
            <div className="page-content container">
                <h1>{isEdit ? `Edit Survey: ${initialSurvey?.title}` : 'Create New Survey'}</h1>
                <div className="detail-view">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="title">Title <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                            <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required />
                            {errors.title && <p className="form-error">{errors.title}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="description">Description <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="4" required></textarea>
                            {errors.description && <p className="form-error">{errors.description}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="departmentId">Department <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                            <select id="departmentId" name="departmentId" value={formData.department.id} onChange={handleChange} required>
                                <option value="">Select Department</option>
                                {dummyDepartments.map(dep => (
                                    <option key={dep.id} value={dep.id}>{dep.name}</option>
                                ))}
                            </select>
                            {errors.departmentId && <p className="form-error">{errors.departmentId}</p>}
                        </div>
                        <div className="form-group">
                            <label>Questions <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                            {formData.questions.map((q, index) => (
                                <div key={index} className="flex-row align-center mb-sm" style={{ gap: 'var(--spacing-md)' }}>
                                    <input
                                        type="text"
                                        name="text"
                                        placeholder={`Question ${index + 1}`}
                                        value={q.text}
                                        onChange={(e) => handleQuestionChange(index, e)}
                                        required
                                        style={{ flex: 1 }}
                                    />
                                    <select
                                        name="type"
                                        value={q.type}
                                        onChange={(e) => handleQuestionChange(index, e)}
                                    >
                                        <option value="rating">Rating</option>
                                        <option value="text">Text</option>
                                        <option value="choice">Multiple Choice</option>
                                    </select>
                                    <button type="button" className="button button-danger" onClick={() => removeQuestion(index)} disabled={formData.questions.length === 1}>
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button type="button" className="button button-secondary mt-sm" onClick={addQuestion}>Add Question</button>
                            {errors.questions && <p className="form-error">{errors.questions}</p>}
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="button button-primary">{isEdit ? 'Save Changes' : 'Create Survey'}</button>
                            <button type="button" className="button button-secondary" onClick={() => onNavigate('SURVEY_LIST')}>Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const FeedbackList = ({ currentUser, onNavigate }) => {
        const filteredFeedback = feedback.filter(f => {
            if (currentUser.role === ROLES.EMPLOYEE) {
                return f.employeeId === currentUser.id;
            }
            if (currentUser.role === ROLES.MANAGER) {
                return surveys.find(s => s.id === f.surveyId)?.departmentId === currentUser.departmentId;
            }
            return true; // Admin/Executive see all
        });

        return (
            <div className="page-content container">
                <h1 style={{ marginBottom: 'var(--spacing-lg)' }}>All Feedback</h1>
                <div className="grid grid-cols-3">
                    {(filteredFeedback.length === 0) ? (
                        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-lg)', backgroundColor: 'var(--color-background-mid)', gridColumn: '1 / -1' }}>
                            <p style={{ marginBottom: 'var(--spacing-md)' }}>No feedback found for your criteria.</p>
                            {(currentUser.role === ROLES.EMPLOYEE) && (
                                <button className="button button-primary" onClick={() => onNavigate('SURVEY_LIST')}>Take a Survey</button>
                            )}
                        </div>
                    ) : (
                        filteredFeedback.map(fb => (
                            <Card
                                key={fb.id}
                                title={`Feedback for ${surveys.find(s => s.id === fb.surveyId)?.title || 'Unknown Survey'}`}
                                subtitle={`From ${findUser(fb.employeeId)?.name}`}
                                content={fb.text}
                                status={fb.status}
                                onClick={() => onNavigate('FEEDBACK_DETAIL', { id: fb.id })}
                                footer={<span>Submitted: {fb.submissionDate}</span>}
                            />
                        ))
                    )}
                </div>
            </div>
        );
    };

    const FeedbackDetail = ({ currentUser, feedbackId, onNavigate, setFeedback }) => {
        const fb = feedback.find(f => f.id === feedbackId);

        const handleUpdateStatus = (newStatus) => {
            if (!fb) return;
            setFeedback(prevFeedback =>
                prevFeedback.map(item =>
                    item.id === feedbackId ? { ...item, status: newStatus } : item
                )
            );
            setAuditLogs(prevLogs => [...prevLogs, {
                id: `log${prevLogs.length + 1}`,
                userId: currentUser?.id,
                action: `Feedback status changed to ${newStatus} for ${findUser(fb?.employeeId)?.name}`,
                entityType: 'FEEDBACK',
                entityId: feedbackId,
                timestamp: new Date().toISOString(),
            }]);
        };

        if (!fb) {
            return (
                <div className="page-content container">
                    <div className="card p-lg" style={{ textAlign: 'center' }}>
                        <h2>Feedback Not Found</h2>
                        <button className="button button-primary mt-md" onClick={() => onNavigate('FEEDBACK_LIST')}>Back to Feedback</button>
                    </div>
                </div>
            );
        }

        const relatedSurvey = surveys.find(s => s.id === fb.surveyId);
        const canApproveReject = (
            (currentUser.role === ROLES.ADMIN) ||
            (currentUser.role === ROLES.MANAGER && relatedSurvey?.departmentId === currentUser.departmentId)
        );

        return (
            <div className="page-content container">
                <div className="detail-view">
                    <div className="detail-header">
                        <div>
                            <h1>Feedback from {findUser(fb.employeeId)?.name}</h1>
                            <p style={{ color: 'var(--color-text-dark)', fontSize: 'var(--font-size-lg)' }}>For survey: <a onClick={() => onNavigate('SURVEY_DETAIL', { id: fb.surveyId })} style={{ cursor: 'pointer' }}>{relatedSurvey?.title || 'Unknown Survey'}</a></p>
                            <div className="mt-md">
                                <span className={`status-badge ${STATUS_COLORS[fb.status]}`}>{STATUS_MAP[fb.status]}</span>
                            </div>
                        </div>
                        {canApproveReject && (fb.status === 'PENDING' || fb.status === 'SUBMITTED' || fb.status === 'ACTION_REQUIRED') && (
                            <div className="flex-row" style={{ gap: 'var(--spacing-md)' }}>
                                <button className="button button-accent" onClick={() => handleUpdateStatus('APPROVED')}>
                                    Approve
                                </button>
                                <button className="button button-danger" onClick={() => handleUpdateStatus('REJECTED')}>
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="detail-section">
                        <h2 className="detail-section-title">Feedback Details</h2>
                        <div className="detail-row"><span className="detail-label">Employee:</span> <span className="detail-value">{findUser(fb.employeeId)?.name}</span></div>
                        <div className="detail-row"><span className="detail-label">Submission Date:</span> <span className="detail-value">{fb.submissionDate}</span></div>
                        <div className="detail-row"><span className="detail-label">Sentiment:</span> <span className="detail-value">{fb.sentiment}</span></div>
                        <div className="detail-row"><span className="detail-label">Message:</span> <span className="detail-value">{fb.text}</span></div>
                    </div>
                </div>
            </div>
        );
    };

    const RecognitionList = ({ currentUser, onNavigate }) => {
        const filteredRecognition = recognition.filter(r => {
            if (currentUser.role === ROLES.EMPLOYEE) {
                return r.recipientId === currentUser.id || r.giverId === currentUser.id;
            }
            if (currentUser.role === ROLES.MANAGER) {
                const recipientDepartment = findUser(r.recipientId)?.departmentId;
                const giverDepartment = findUser(r.giverId)?.departmentId;
                return recipientDepartment === currentUser.departmentId || giverDepartment === currentUser.departmentId;
            }
            return true; // Admin/Executive see all
        });

        return (
            <div className="page-content container">
                <h1 style={{ marginBottom: 'var(--spacing-lg)' }}>All Recognition</h1>
                <div className="grid grid-cols-3">
                    {(filteredRecognition.length === 0) ? (
                        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-lg)', backgroundColor: 'var(--color-background-mid)', gridColumn: '1 / -1' }}>
                            <p style={{ marginBottom: 'var(--spacing-md)' }}>No recognition records found for your criteria.</p>
                            {(currentUser.role === ROLES.EMPLOYEE) && (
                                <button className="button button-primary" onClick={() => alert('Sending Recognition (feature not implemented)')}>Give Recognition</button>
                            )}
                        </div>
                    ) : (
                        filteredRecognition.map(rec => (
                            <Card
                                key={rec.id}
                                title={`To: ${findUser(rec.recipientId)?.name}`}
                                subtitle={`From: ${findUser(rec.giverId)?.name}`}
                                content={rec.message}
                                status={rec.status}
                                onClick={() => onNavigate('RECOGNITION_DETAIL', { id: rec.id })}
                                footer={<span>Date: {rec.date}</span>}
                            />
                        ))
                    )}
                </div>
            </div>
        );
    };

    const RecognitionDetail = ({ currentUser, recognitionId, onNavigate, setRecognition }) => {
        const rec = recognition.find(r => r.id === recognitionId);

        const handleUpdateStatus = (newStatus) => {
            if (!rec) return;
            setRecognition(prevRecognition =>
                prevRecognition.map(item =>
                    item.id === recognitionId ? { ...item, status: newStatus } : item
                )
            );
            setAuditLogs(prevLogs => [...prevLogs, {
                id: `log${prevLogs.length + 1}`,
                userId: currentUser?.id,
                action: `Recognition status changed to ${newStatus} for ${findUser(rec?.recipientId)?.name}`,
                entityType: 'RECOGNITION',
                entityId: recognitionId,
                timestamp: new Date().toISOString(),
            }]);
        };

        if (!rec) {
            return (
                <div className="page-content container">
                    <div className="card p-lg" style={{ textAlign: 'center' }}>
                        <h2>Recognition Not Found</h2>
                        <button className="button button-primary mt-md" onClick={() => onNavigate('RECOGNITION_LIST')}>Back to Recognition</button>
                    </div>
                </div>
            );
        }

        const canApproveReject = currentUser.role === ROLES.ADMIN ||
                                (currentUser.role === ROLES.MANAGER && (
                                    findUser(rec.recipientId)?.departmentId === currentUser.departmentId ||
                                    findUser(rec.giverId)?.departmentId === currentUser.departmentId
                                ));

        return (
            <div className="page-content container">
                <div className="detail-view">
                    <div className="detail-header">
                        <div>
                            <h1>Recognition for {findUser(rec.recipientId)?.name}</h1>
                            <p style={{ color: 'var(--color-text-dark)', fontSize: 'var(--font-size-lg)' }}>From: {findUser(rec.giverId)?.name}</p>
                            <div className="mt-md">
                                <span className={`status-badge ${STATUS_COLORS[rec.status]}`}>{STATUS_MAP[rec.status]}</span>
                            </div>
                        </div>
                        {canApproveReject && (rec.status === 'PENDING') && (
                            <div className="flex-row" style={{ gap: 'var(--spacing-md)' }}>
                                <button className="button button-accent" onClick={() => handleUpdateStatus('APPROVED')}>
                                    Approve
                                </button>
                                <button className="button button-danger" onClick={() => handleUpdateStatus('REJECTED')}>
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="detail-section">
                        <h2 className="detail-section-title">Message</h2>
                        <p style={{ fontSize: 'var(--font-size-base)', lineHeight: '1.6', color: 'var(--color-text-dark)' }}>{rec.message}</p>
                    </div>

                    <div className="detail-section">
                        <h2 className="detail-section-title">Details</h2>
                        <div className="detail-row"><span className="detail-label">Recipient:</span> <span className="detail-value">{findUser(rec.recipientId)?.name}</span></div>
                        <div className="detail-row"><span className="detail-label">Giver:</span> <span className="detail-value">{findUser(rec.giverId)?.name}</span></div>
                        <div className="detail-row"><span className="detail-label">Date:</span> <span className="detail-value">{rec.date}</span></div>
                    </div>
                </div>
            </div>
        );
    };

    const AuditLogScreen = ({ currentUser, onNavigate }) => {
        if (currentUser.role !== ROLES.ADMIN) {
            return (
                <div className="page-content container">
                    <div className="card p-lg" style={{ textAlign: 'center' }}>
                        <h2>Access Denied</h2>
                        <p>You do not have permission to view audit logs.</p>
                        <button className="button button-primary mt-md" onClick={() => onNavigate('DASHBOARD')}>Back to Dashboard</button>
                    </div>
                </div>
            );
        }

        return (
            <div className="page-content container">
                <h1>Audit Logs</h1>
                <div className="detail-view">
                    {auditLogs.length === 0 ? (
                        <p>No audit logs available.</p>
                    ) : (
                        <div className="flex-col" style={{ gap: 'var(--spacing-sm)' }}>
                            {auditLogs.map(log => (
                                <div key={log.id} className="card" style={{ padding: 'var(--spacing-md)', margin: 0, cursor: 'default' }}>
                                    <div className="flex-between align-center">
                                        <p style={{ fontWeight: 'var(--font-weight-medium)' }}>{log.action}</p>
                                        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-dark)' }}>
                                            {new Date(log.timestamp).toLocaleString()} by {findUser(log.userId)?.name || 'Unknown User'}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-dark)' }}>
                                        Entity: {log.entityType} (ID: {log.entityId})
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const UserProfile = ({ currentUser, onNavigate }) => {
        if (!currentUser) {
            return (
                <div className="page-content container">
                    <div className="card p-lg" style={{ textAlign: 'center' }}>
                        <h2>User Not Logged In</h2>
                        <button className="button button-primary mt-md" onClick={() => onNavigate('LOGIN')}>Go to Login</button>
                    </div>
                </div>
            );
        }

        return (
            <div className="page-content container">
                <h1>User Profile</h1>
                <div className="detail-view">
                    <div className="detail-section">
                        <h2 className="detail-section-title">Personal Information</h2>
                        <div className="detail-row"><span className="detail-label">Name:</span> <span className="detail-value">{currentUser.name}</span></div>
                        <div className="detail-row"><span className="detail-label">Email:</span> <span className="detail-value">{currentUser.email}</span></div>
                    </div>
                    <div className="detail-section">
                        <h2 className="detail-section-title">Role & Department</h2>
                        <div className="detail-row"><span className="detail-label">Role:</span> <span className="detail-value">{STATUS_MAP[currentUser.role] || currentUser.role}</span></div>
                        <div className="detail-row"><span className="detail-label">Department:</span> <span className="detail-value">{findDepartment(currentUser.departmentId)?.name || 'N/A'}</span></div>
                    </div>
                    <div className="form-actions">
                        <button className="button button-secondary" onClick={() => alert('Edit Profile (feature not implemented)')}>Edit Profile</button>
                        <button className="button button-danger" onClick={logout}>Logout</button>
                    </div>
                </div>
            </div>
        );
    };

    // --- Main App Render Logic ---
    return (
        <div className="App">
            {view.screen === 'LOGIN' ? (
                <LoginScreen onLogin={login} />
            ) : (
                <>
                    <Header
                        user={currentUser}
                        breadcrumbs={getBreadcrumbs()}
                        onLogout={logout}
                        onNavigate={navigate}
                    />
                    <main>
                        {view.screen === 'DASHBOARD' && <Dashboard currentUser={currentUser} onNavigate={navigate} />}
                        {view.screen === 'SURVEY_LIST' && <SurveyList currentUser={currentUser} onNavigate={navigate} />}
                        {view.screen === 'SURVEY_DETAIL' && <SurveyDetail currentUser={currentUser} surveyId={view.params?.id} onNavigate={navigate} setSurveys={setSurveys} />}
                        {view.screen === 'SURVEY_FORM' && <SurveyForm currentUser={currentUser} surveyId={view.params?.id} mode={view.params?.mode} onNavigate={navigate} setSurveys={setSurveys} />}
                        {view.screen === 'FEEDBACK_LIST' && <FeedbackList currentUser={currentUser} onNavigate={navigate} />}
                        {view.screen === 'FEEDBACK_DETAIL' && <FeedbackDetail currentUser={currentUser} feedbackId={view.params?.id} onNavigate={navigate} setFeedback={setFeedback} />}
                        {view.screen === 'RECOGNITION_LIST' && <RecognitionList currentUser={currentUser} onNavigate={navigate} />}
                        {view.screen === 'RECOGNITION_DETAIL' && <RecognitionDetail currentUser={currentUser} recognitionId={view.params?.id} onNavigate={navigate} setRecognition={setRecognition} />}
                        {view.screen === 'AUDIT_LOGS' && <AuditLogScreen currentUser={currentUser} onNavigate={navigate} />}
                        {view.screen === 'USER_PROFILE' && <UserProfile currentUser={currentUser} onNavigate={navigate} />}
                    </main>
                </>
            )}
        </div>
    );
}

export default App;