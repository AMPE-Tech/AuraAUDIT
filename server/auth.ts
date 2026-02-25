import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { storage } from "./storage";
import bcrypt from "bcrypt";

const PgStore = connectPgSimple(session);

declare module "express-session" {
  interface SessionData {
    userId: string;
    username: string;
    role: string;
    clientId: string | null;
    fullName: string;
  }
}

export function setupAuth(app: Express) {
  app.use(
    session({
      store: new PgStore({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "auraaudit-session-secret-dev",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      },
    })
  );

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Usuario e senha sao obrigatorios" });
    }

    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: "Credenciais invalidas" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Credenciais invalidas" });
    }

    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;
    req.session.clientId = user.clientId;
    req.session.fullName = user.fullName;

    return res.json({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      clientId: user.clientId,
    });
  });

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    const { username, password, fullName } = req.body;

    if (!username || !password || !fullName) {
      return res.status(400).json({ message: "Todos os campos sao obrigatorios" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Senha deve ter no minimo 6 caracteres" });
    }

    const existing = await storage.getUserByUsername(username);
    if (existing) {
      return res.status(409).json({ message: "Usuario ja existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await storage.createUser({
      username,
      password: hashedPassword,
      fullName,
      role: "client",
    });

    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;
    req.session.clientId = user.clientId;
    req.session.fullName = user.fullName;

    return res.status(201).json({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      clientId: user.clientId,
    });
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao encerrar sessao" });
      }
      res.clearCookie("connect.sid");
      return res.json({ message: "Sessao encerrada" });
    });
  });

  app.get("/api/auth/user", (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Nao autenticado" });
    }

    return res.json({
      id: req.session.userId,
      username: req.session.username,
      fullName: req.session.fullName,
      role: req.session.role,
      clientId: req.session.clientId,
    });
  });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Autenticacao necessaria" });
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Autenticacao necessaria" });
  }
  if (req.session.role !== "admin" && req.session.role !== "auditor") {
    return res.status(403).json({ message: "Acesso restrito" });
  }
  next();
}
