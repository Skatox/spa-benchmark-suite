# 🧠 Comparative Performance Analysis of Frontend Frameworks for SPAs

**Master’s Thesis Project — Universidad Nacional Experimental del Táchira (UNET)**  
**Author:** Ing. Miguel Useche  
**Advisor:** Msc. Jose Orlando Figueroa  
**Degree:** Maestría en Ingeniería Informática  
**Year:** 2025  

---

## 📖 Overview

This repository contains the experimental implementations and benchmark results developed for a master’s thesis focused on **comparing the performance of modern frontend libraries** used in the development of **Single Page Applications (SPA)**.

The comparison includes the following frameworks:
- **React**
- **Vue**
- **Svelte**

Each SPA reproduces the same core functionality to ensure consistent testing conditions.  
The evaluation follows a structured methodology for performance measurement and analysis.

---

## 🎯 Objective

To identify **performance differences** among major frontend libraries for SPA development and to provide **quantitative insights** that help developers and organizations choose the most efficient and maintainable technology for their needs.

---

## 🧩 Repository Structure

```
/react-app        → SPA implemented with React
/vue-app          → SPA implemented with Vue
/svelte-app       → SPA implemented with Svelte
/scripts          → Benchmark and metric collection scripts
/results          → Performance data, charts, and analysis reports
/docs             → Thesis documentation and reference material
```

---

## ⚙️ Technologies Used

| Category | Tools |
|-----------|--------|
| Frontend Frameworks | React, Vue, Svelte |
| Build Tools | Vite, Node.js |
| Performance Testing | Lighthouse, WebPageTest, Chrome DevTools, Performance API |
| Data Analysis | Python, Pandas, Matplotlib |
| Version Control | Git + GitHub |

---

## 🚀 Setup & Installation

### 1️⃣ Clone the repository
```bash
git clone https://github.com/Skatox/spa-benchmark-suite.git
cd spa-benchmark-suite
```

### 2️⃣ Install dependencies
Each application has its own package.json file.  
Example for React:
```bash
cd react-app
npm install
npm run dev
```

Do the same for `/vue-app` and `/svelte-app`.

### 3️⃣ Run performance tests
Use the scripts in the `/scripts` folder:
```bash
cd scripts
python run_tests.py
```

These scripts can automate Lighthouse tests, collect metrics (First Contentful Paint, TTI, TBT, etc.) and store results in `/results`.

---

## 📊 Methodology Summary

The evaluation follows a **comparative experimental design** consisting of:

1. **Controlled environment setup:**  
   Each SPA runs on identical hardware and browser conditions.
2. **Performance measurement:**  
   Metrics collected via Lighthouse, Chrome DevTools, and the browser Performance API.
3. **Quantitative data analysis:**  
   Processed using Python scripts and visualized through charts.
4. **Interpretation and conclusions:**  
   Results are compared to identify trade-offs in performance, complexity, and maintainability.

---

## 📈 Key Metrics Evaluated

- **First Contentful Paint (FCP)**  
- **Time to Interactive (TTI)**  
- **Total Blocking Time (TBT)**  
- **Memory Usage (MB)**  
- **Bundle Size (KB)**  
- **Frames per Second (FPS)**  
- **DOM Update Latency**

---

## 📚 Academic Context (Español)

Este repositorio forma parte de la tesis de maestría titulada:  
**“Análisis comparativo del rendimiento de librerías frontend para el desarrollo de aplicaciones web de una sola página (SPA)”**,  
presentada en la **Universidad Nacional Experimental del Táchira (UNET)** como requisito parcial para optar al título de **Magíster en Ingeniería Informática**.

---

## 👨‍💻 Author

**Ing. Miguel Useche**  
Software Engineer | Professor | Researcher  
📍 Cúcuta, Colombia  
🌐 [linkedin.com/in/migueluseche](https://linkedin.com/in/migueluseche)

---

## 📜 License

This project is released under the **GNU General Public License v3.0 (GPL-3.0)**.  
You are free to use, modify, and distribute this work under the terms of the GNU General Public License v3.0. See the LICENSE file for details.

---

## 🧩 Citation

If you use this repository in academic work, please cite as:

> Useche, M. (2025). *Análisis comparativo del rendimiento de librerías frontend para el desarrollo de aplicaciones web de una sola página (SPA).* Universidad Nacional Experimental del Táchira.

---

## 🧠 Keywords

`React` • `Vue` • `Svelte` • `SPA` • `Performance` • `Benchmark` • `Frontend` • `Web Development` • `JavaScript`

---
