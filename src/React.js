import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { starterTemplates, demoPortfolio } from "./data";

export const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));

export function usePortify() {
  const [user, setUser] = useState(() => read("portify_session", null));
  const [templates, setTemplates] = useState(() => read("portify_templates", starterTemplates));
  const [portfolio, setPortfolio] = useState(() => read("portify_portfolio", demoPortfolio));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => save("portify_templates", templates), [templates]);
  useEffect(() => save("portify_portfolio", portfolio), [portfolio]);
  useEffect(() => save("portify_session", user), [user]);

  function logout() { setUser(null); navigate("/"); }
  function login(email, password, adminOnly = false) {
    if (adminOnly && email === "admin@portify.com" && password === "admin123") {
      const admin = { name: "Admin", email, role: "admin" }; setUser(admin); save("portify_session", admin); navigate("/admin"); return { ok: true };
    }
    if (adminOnly) return { ok: false, message: "Invalid admin credentials." };
    const users = read("portify_users", []);
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!found) return { ok: false, message: "Account not found or password is incorrect. Please sign up first." };
    const session = { name: found.name, email: found.email, role: "user" };
    setUser(session); save("portify_session", session); navigate("/dashboard"); return { ok: true };
  }
  function signup(name, email, password) {
    const users = read("portify_users", []);
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) return { ok: false, message: "An account with this email already exists." };
    const next = [...users, { name, email, password, createdAt: new Date().toISOString() }];
    save("portify_users", next);
    const session = { name, email, role: "user" }; setUser(session); save("portify_session", session);
    navigate("/dashboard"); return { ok: true };
  }
  const updateTemplates = fn => setTemplates(current => fn(current));
  const protectedProps = { user, templates, portfolio, setPortfolio, updateTemplates, logout, login, signup };
  return { user, templates, portfolio, mobileOpen, setMobileOpen, location, logout, login, signup, protectedProps };
}