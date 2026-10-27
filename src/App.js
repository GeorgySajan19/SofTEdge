import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { softSkills } from "./data";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  return (
    <BrowserRouter>
      <div className="app">
        <nav className="navbar">
          <Link to="/" className="logo">SoftSkills App</Link>
          <div>
            {user ? (
              <>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <button onClick={() => signOut(auth)} className="btn-logout">Logout</button>
              </>
            ) : (
              <Link to="/login" className="btn-login">Login</Link>
            )}
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Login />} />
          <Route path="/skill/:id" element={user ? <SkillDetail /> : <Login />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

// Home Page
function Home() {
  return (
    <div className="container center">
      <h1>Learn Soft Skills</h1>
      <p>For Students, College, School & Elders</p>
      <Link to="/login" className="btn">Start Learning</Link>
    </div>
  );
}

// Login Page
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>{isRegister ? "Create Account" : "Login"}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn">
            {isRegister ? "Sign Up" : "Login"}
          </button>
        </form>

        <button onClick={handleGoogle} className="btn-google">
          Continue with Google
        </button>

        <p className="switch">
          {isRegister ? "Already have an account?" : "New user?"}{" "}
          <span onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? "Login" : "Register"}
          </span>
        </p>
      </div>
    </div>
  );
}

// Dashboard
function Dashboard() {
  return (
    <div className="container">
      <h1>Choose a Soft Skill</h1>
      <div className="skills-grid">
        {softSkills.map((skill) => (
          <Link to={`/skill/${skill.id}`} key={skill.id} className="skill-card">
            <div className="icon">{skill.icon}</div>
            <h3>{skill.title}</h3>
            <p>{skill.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Skill Detail
function SkillDetail() {
  const { id } = useParams();
  const skill = softSkills.find((s) => s.id === id);
  const [showQuiz, setShowQuiz] = useState(false);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);

  if (!skill) return <div className="container">Skill not found</div>;

  const handleAnswer = (questionIndex, selectedOption) => {
    setAnswers({ ...answers, [questionIndex]: selectedOption });
  };

  const submitQuiz = () => {
    let correct = 0;
    skill.quiz.forEach((q, index) => {
      if (answers[index] === q.answer) {
        correct++;
      }
    });
    const percentage = Math.round((correct / skill.quiz.length) * 100);
    setScore(percentage);
  };

  return (
    <div className="container">
      <Link to="/dashboard" className="back">← Back</Link>

      <div className="card" style={{ maxWidth: "700px" }}>
        <div className="icon big">{skill.icon}</div>
        <h1>{skill.title}</h1>
        <p>{skill.description}</p>

        {/* YouTube Video */}
        {skill.video && (
          <div style={{ margin: "20px 0" }}>
            <iframe
              width="100%"
              height="350"
              src={skill.video}
              title={skill.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ borderRadius: "10px" }}
            ></iframe>
          </div>
        )}

        {!showQuiz ? (
          <>
            <h3>Lessons:</h3>
            <ul>
              {skill.lessons.map((lesson, index) => (
                <li key={index}>{index + 1}. {lesson}</li>
              ))}
            </ul>

            <button 
              className="btn" 
              style={{ marginTop: "20px" }} 
              onClick={() => setShowQuiz(true)}
            >
              Take Quiz
            </button>
          </>
        ) : (
          <>
            <h3>Quiz</h3>
            {skill.quiz.map((q, index) => (
              <div key={index} style={{ marginBottom: "20px" }}>
                <p><strong>{index + 1}. {q.question}</strong></p>
                {q.options.map((option) => (
                  <label key={option} style={{ display: "block", margin: "6px 0", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={option}
                      onChange={() => handleAnswer(index, option)}
                      style={{ marginRight: "8px" }}
                    />
                    {option}
                  </label>
                ))}
              </div>
            ))}

            {score === null ? (
              <button className="btn" onClick={submitQuiz}>
                Submit Quiz
              </button>
            ) : (
              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <h2>Your Score: {score}%</h2>
                <p>{score >= 70 ? "Great job! 🎉" : "Good effort! Try again."}</p>
                <button 
                  className="btn" 
                  style={{ marginTop: "15px" }} 
                  onClick={() => {
                    setShowQuiz(false);
                    setScore(null);
                    setAnswers({});
                  }}
                >
                  Back to Lessons
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;