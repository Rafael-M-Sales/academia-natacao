# Roteiro de apresentação ao cliente

## Antes da reunião (no seu notebook)

Terminal 1:

```powershell
cd "c:\Users\(-_-)\.gemini\antigravity\scratch\academia-natacao"
npm run server
```

Terminal 2:

```powershell
npm run dev
```

Abra no navegador: **http://localhost:5173**

---

## 1. Coordenador (tela grande) — admin@h2ocontrol.com / admin

| Demonstração | Onde |
|--------------|------|
| Cadastrar novo aluno | **Alunos** → Novo aluno |
| Ver inadimplentes e registrar pagamento | **Administração** → Financeiro |
| Aulas ao vivo dos professores | **Dashboard** → bloco "Aulas ao vivo" |
| Evoluções por voz dos professores | **Pedagógico** → lista no topo |

---

## 2. Professor (celular) — http://SEU-IP:5173/#professor

No celular, mesma rede Wi‑Fi do notebook. Descubra o IP: `ipconfig` → IPv4 (ex.: 192.168.1.10).

URL: `http://192.168.1.10:5173/#professor`

1. Escolher professor (ex.: Amanda Costa)
2. PIN: **1234**
3. Escolher turma → **Iniciar aula ao vivo**
4. Tocar no microfone e falar:
   - *"presente Guilherme"*
   - *"evolução Mariana nadou crawl 25 metros"*
   - *"encerrar aula"*

O painel do coordenador atualiza em **tempo real** (alguns segundos).

---

## Netlify hoje?

- **Só Netlify:** não cobre API + voz + tempo real.
- **Recomendado para hoje:** notebook com os dois comandos acima + celular na mesma rede.
- **Depois:** Netlify (site) + Render (API com `render.yaml`).
