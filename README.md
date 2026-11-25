# bell-nonlocality-chsh-coop-escape

> **Campaña de Escape Room Cuántico Cooperativo & Asimétrico: Desigualdad CHSH de Bell, Paradoja GHZ de Mermin y Teletransportación Cuántica.**  
> *Galardonado en la física con el Premio Nobel de 2022 (Aspect, Clauser, Zeilinger).*

---

## 📌 Visión General

`bell-nonlocality-chsh-coop-escape` es un videojuego científico de lógica cuántica donde dos operativos (**Alice y Bob**) se encuentran confinados en cámaras espaciales incomunicadas (*No-Signaling*). Un Verificador les envía preguntas binarias independientes $x, y \in \{0, 1\}$ y las esclusas solo se abren si sus respuestas $a, b \in \{0, 1\}$ satisfacen la condición:

$$a \oplus b = x \cdot y$$

- **Bajo física clásica (Variables Ocultas Locales - LHV):** Ninguna estrategia preacordada puede superar una tasa de acierto del **$75\%$** ($S \le 2$).
- **Bajo entrelazamiento cuántico (Pares EPR $|\Phi^+\rangle$):** Al calibrar los ángulos de detección a las bases óptimas de Tsirelson ($\theta_A \in \{0, \pi/2\}$, $\theta_B \in \{\pi/4, -\pi/4\}$), el sistema alcanza una tasa del **$\cos^2(\pi/8) \approx 85.36\%$** con una violación de Bell de **$S = 2\sqrt{2} \approx 2.8284$**.
- **Bajo estados tripartitos GHZ ($|\text{GHZ}\rangle$):** El equipo de tres operativos logra una tasa de éxito del **$100\%$ determinista**, eliminando la necesidad de promedios estadísticos para refutar el realismo local de Einstein.

---

## 🚀 Características Principales

1. **Motor Tensorial de Estados Cuánticos (`js/bell-ghz-tensor.js`):**
   - Álgebra de números complejos y matrices de rotación $R_y(\theta)$.
   - Generación de los 4 estados de Bell ($|\Phi^+\rangle, |\Phi^-\rangle, |\Psi^+\rangle, |\Psi^-\rangle$).
   - Simulación de estados GHZ y teletransportación con *feed-forward* clásico.
2. **Bot de Variables Ocultas Locales (`js/lhv-classical-bot.js`):**
   - Implementa exhaustivamente las 16 estrategias deterministas locales demostrando empíricamente la barrera infranqueable del 75%.
3. **Campaña Progresiva de 15 Cámaras de Escape (`js/chsh-mermin-rooms.js`):**
   - **Fase I:** Límites Clásicos (LHV) y la cota $S \le 2.0$.
   - **Fase II:** Violación CHSH y aproximación a la cota de Tsirelson.
   - **Fase III:** Paradoja GHZ Mermin con Charlie (100% éxito cuántico).
   - **Fase IV:** Protocolo de Teletransportación cuántica y Cuadrado Mágico de Mermin-Peres.
4. **Exportador Dinámico OpenQASM 3.0 (`js/qasm-dynamic-bridge.js`):**
   - Exporta el código de circuito ejecutable directamente en procesadores cuánticos de IBM Quantum.
5. **Persistencia SQLite (`js/db.js`):**
   - Registro de experimentos, histórico de parámetros $S$ y progreso de desbloqueo de salas.

---

## 💻 Ejecución Local

No requiere transpilación ni instalación de dependencias pesadas:
```bash
# Servir con cualquier servidor HTTP estático
npx serve .
# o con Python
python -m http.server 8080
```
Abre tu navegador en `http://localhost:8080` (o la ruta correspondiente).
