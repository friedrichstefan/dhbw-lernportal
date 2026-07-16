import { registerPage, setPageCleanup } from '../main.js'
import { mountFlashcards } from '../components/flashcard.js'
import { mountQuiz } from '../components/quiz.js'
import { mountTextExercises } from '../components/exercises.js'
import { getProgress } from '../progress.js'
import { fetchJson } from '../data.js'

registerPage('programmieren', async (app) => {
  const [cards, questions, textExercises] = await Promise.all([
    fetchJson('data/programmieren/flashcards.json'),
    fetchJson('data/programmieren/quiz.json'),
    fetchJson('data/programmieren/text_exercises.json'),
  ])

  async function calcPcts() {
    const { flashcards: fc, quiz_scores: qs } = await getProgress()
    const totalCards = cards.length
    const cardPct = totalCards ? Math.round(cards.filter(c => fc[c.id] === 'known').length / totalCards * 100) : 0
    const totalQuiz = questions.length
    const quizPct = totalQuiz ? Math.round((qs['programmieren']?.last ?? 0) / totalQuiz * 100) : 0
    const parts = [cardPct]
    if (totalQuiz) parts.push(quizPct)
    const overallPct = Math.round(parts.reduce((a, b) => a + b, 0) / parts.length)
    return { overallPct, cardPct, quizPct, totalQuiz }
  }

  async function renderProgressBars() {
    const el = app.querySelector('#prog-progress-section')
    if (!el) return
    el.innerHTML = progressBarsHtml(await calcPcts())
  }

  const p = await calcPcts()

  const codeExamples = [
    { title: 'Exception Handling: eigene Exception', lang: 'java', code: `// Eigene Checked Exception
public class TankLeer extends Exception {
    public TankLeer(int km) {
        super("Der Tank ist leer nach " + km + " km.");
    }
}

// Methode wirft Exception
public void drive(int km) throws TankLeer {
    if (tank <= 0) throw new TankLeer(kmCount);
    tank -= km;
    kmCount += km;
}

// Behandlung
try {
    bmw.drive(500);
} catch (TankLeer e1) {
    System.out.println(e1.getMessage());
} catch (Exception e2) {
    e2.printStackTrace();
} finally {
    System.out.println("Fahrt beendet.");
}` },
    { title: 'Collections: List & Iterator', lang: 'java', code: `import java.util.ArrayList;
import java.util.Iterator;

ArrayList<String> myList = new ArrayList<>();
myList.add("Otto");
myList.add("Karl");
myList.add("Ludwig");
myList.set(2, "Overwrites Ludwig");

System.out.println(myList.contains("Otto")); // true
System.out.println(myList.indexOf("Karl"));  // 1
System.out.println(myList.size());           // 3

// Iterator
Iterator<String> i = myList.iterator();
while (i.hasNext()) {
    System.out.println(i.next());
}
myList.clear();` },
    { title: 'Collections: TreeSet mit Comparable', lang: 'java', code: `// Klasse implementiert Comparable
public class Student implements Comparable<Student> {
    private int matrikelNo;
    private String firstName, lastName;

    @Override
    public int compareTo(Object vStudent) {
        return this.matrikelNo - ((Student) vStudent).getMatrikelNo();
    }
}

// TreeSet sortiert automatisch
import java.util.TreeSet;
TreeSet<Student> set = new TreeSet<>();
set.add(new Student("Peter", "Maier", 75382));
set.add(new Student("Hans", "Müller", 65871));

Iterator<Student> it = set.iterator();
while (it.hasNext()) {
    Student s = it.next();
    System.out.println(s.getMatrikelNo() + " " + s.getLastName());
}` },
    { title: 'equals() und hashCode()', lang: 'java', code: `public class Pet {
    private String species;
    private int weight;

    @Override
    public boolean equals(Object object) {
        if (this == object) return true;          // alias check
        if (object == null) return false;         // null check
        if (object.getClass() != this.getClass()) return false;
        if (!this.species.equals(((Pet) object).species)) return false;
        if (this.weight != ((Pet) object).weight) return false;
        return true;
    }

    @Override
    public int hashCode() {
        // hashCode-Vertrag: equals()==true → gleicher hashCode
        return this.species.hashCode() ^ this.weight;
    }
}` },
    { title: 'Swing: JFrame mit ActionListener', lang: 'java', code: `import javax.swing.*;
import java.awt.*;
import java.awt.event.*;

JFrame window = new JFrame("Demo");
window.setDefaultCloseOperation(WindowConstants.EXIT_ON_CLOSE);
window.getContentPane().setLayout(new FlowLayout());

ActionListener listener = new ActionListener() {
    public void actionPerformed(ActionEvent e) {
        String event = e.getActionCommand();
        if (event.equals("OK")) {
            System.out.println("OK gedrückt.");
        } else if (event.equals("Exit")) {
            System.exit(0);
        }
    }
};

JButton ok = new JButton("OK");
JButton exit = new JButton("Exit");
ok.addActionListener(listener);
exit.addActionListener(listener);

window.getContentPane().add(ok);
window.getContentPane().add(exit);
window.pack();
window.setVisible(true);` },
    { title: 'I/O: Textdatei lesen & schreiben', lang: 'java', code: `import java.io.*;

// Lesen mit try-with-resource (automatisches Schließen)
try (BufferedReader reader = new BufferedReader(
        new FileReader("eingabe.txt"))) {
    String line;
    while ((line = reader.readLine()) != null) {
        System.out.println(line);
    }
} catch (IOException e) {
    e.printStackTrace();
}

// Schreiben
try (BufferedWriter writer = new BufferedWriter(
        new FileWriter("ausgabe.txt"))) {
    writer.write("Erste Zeile");
    writer.newLine();
    writer.write("Zweite Zeile");
} catch (IOException e) {
    e.printStackTrace();
}` },
    { title: 'Datenstrukturen: Stack & Queue', lang: 'java', code: `import java.util.ArrayDeque;

// Stack (LIFO) mit ArrayDeque
ArrayDeque<String> stack = new ArrayDeque<>();
stack.push("Erster");    // push oben
stack.push("Zweiter");
System.out.println(stack.peek());  // "Zweiter" – lesen ohne entfernen
System.out.println(stack.pop());   // "Zweiter" – entfernen
System.out.println(stack.pop());   // "Erster"

// Queue (FIFO) mit ArrayDeque
ArrayDeque<String> queue = new ArrayDeque<>();
queue.offer("Erster");   // hinten einreihen
queue.offer("Zweiter");
System.out.println(queue.peek());  // "Erster" – vorne lesen
System.out.println(queue.poll());  // "Erster" – vorne entfernen` },
    { title: 'Algorithmen: Fibonacci & Binäre Suche', lang: 'java', code: `// Fibonacci iterativ – O(n)
public static int fibonacci(int n) {
    if (n <= 1) return n;
    int a = 0, b = 1;
    for (int i = 2; i <= n; i++) {
        int c = a + b; a = b; b = c;
    }
    return b;
}
System.out.println(fibonacci(10)); // 55

// Binäre Suche – O(log n) – Voraussetzung: sortiertes Array
public static int binarySearch(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1; // nicht gefunden
}` }
  ]

  app.innerHTML = `
    <div class="page-container">
      <h1 class="page-title">Programmieren</h1>
      <div class="card" style="margin-bottom:var(--space-xl)">
        <p class="text-secondary" style="margin-bottom:var(--space-sm)">Dein Lernfortschritt — Programmieren</p>
        <div id="prog-progress-section">
          ${progressBarsHtml(p)}
        </div>
      </div>
      <p class="text-secondary" style="margin-bottom:var(--space-xl)">Einzelklausur · Java &amp; Algorithmen</p>
      <div class="sub-tabs">
        <button class="sub-tab active" data-tab="flashcards">Karteikarten</button>
        <button class="sub-tab" data-tab="quiz">Quiz</button>
        <button class="sub-tab" data-tab="code">Code-Beispiele</button>
        <button class="sub-tab" data-tab="aufgaben">Aufgaben</button>
      </div>
      <div id="tab-content"></div>
    </div>`

  const tabs = app.querySelectorAll('.sub-tab')
  const content = app.querySelector('#tab-content')

  function renderCode() {
    content.innerHTML = codeExamples.map(ex => `
      <div class="card" style="margin-bottom:var(--space-lg)">
        <h3 style="font-size:18px;font-weight:700;margin-bottom:var(--space-lg)">${ex.title}</h3>
        <div class="code-block">
          <button class="copy-btn" data-code="${encodeURIComponent(ex.code)}">Kopieren</button>
          <pre><code>${ex.code.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</code></pre>
        </div>
      </div>`).join('')
    content.querySelectorAll('.copy-btn').forEach(btn => {
      btn.onclick = () => {
        navigator.clipboard.writeText(decodeURIComponent(btn.dataset.code))
        btn.textContent = '✓ Kopiert!'
        setTimeout(() => btn.textContent = 'Kopieren', 2000)
      }
    })
  }

  function activate(name) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name))
    if (name === 'flashcards') {
      content.innerHTML = `<div class="skeleton skeleton-fc"></div>`
      mountFlashcards(content, cards)
    } else if (name === 'quiz') {
      content.innerHTML = Array(3).fill(`
        <div class="skeleton-card" style="margin-bottom:var(--space-md)">
          <div class="skeleton skeleton-text" style="width:80%;margin-bottom:var(--space-lg)"></div>
          <div class="skeleton skeleton-text" style="width:100%;margin-bottom:var(--space-sm)"></div>
          <div class="skeleton skeleton-text" style="width:100%;margin-bottom:var(--space-sm)"></div>
          <div class="skeleton skeleton-text" style="width:100%"></div>
        </div>`).join('')
      mountQuiz(content, questions, 'programmieren')
    } else if (name === 'aufgaben') {
      content.innerHTML = Array(3).fill(`
        <div class="skeleton-card" style="margin-bottom:var(--space-md)">
          <div class="skeleton skeleton-text" style="width:55%;margin-bottom:var(--space-md)"></div>
          <div class="skeleton skeleton-text" style="width:90%;margin-bottom:var(--space-sm)"></div>
          <div class="skeleton skeleton-text" style="width:70%"></div>
        </div>`).join('')
      mountTextExercises(content, textExercises)
    } else {
      content.innerHTML = ''
      if (name === 'code') renderCode()
    }
  }
  tabs.forEach(t => { t.onclick = () => activate(t.dataset.tab) })
  activate('flashcards')

  window.addEventListener('progress-updated', renderProgressBars)
  setPageCleanup(() => window.removeEventListener('progress-updated', renderProgressBars))
})

function progressBarsHtml({ overallPct, cardPct, quizPct, totalQuiz }) {
  return `
    <div style="display:flex;align-items:center;gap:var(--space-xl);flex-wrap:wrap;margin-bottom:var(--space-md)">
      <div><span style="font-size:32px;font-weight:500;color:var(--color-primary)">${overallPct}%</span> <span class="text-secondary">gesamt</span></div>
      <div style="flex:1;min-width:160px"><div class="progress-bar" style="height:10px"><div class="progress-bar-fill" style="width:${overallPct}%"></div></div></div>
    </div>
    <div class="stat-row">
      <div style="display:flex;align-items:center;gap:var(--space-sm)">
        <span style="font-size:13px;color:var(--color-steel)">Karteikarten</span>
        <div class="progress-bar" style="width:80px"><div class="progress-bar-fill" style="width:${cardPct}%"></div></div>
        <span style="font-size:13px;font-weight:600;color:var(--color-primary)">${cardPct}%</span>
      </div>
      ${totalQuiz ? `<div style="display:flex;align-items:center;gap:var(--space-sm)">
        <span style="font-size:13px;color:var(--color-steel)">Quiz</span>
        <div class="progress-bar" style="width:80px"><div class="progress-bar-fill" style="width:${quizPct}%"></div></div>
        <span style="font-size:13px;font-weight:600;color:var(--color-primary)">${quizPct}%</span>
      </div>` : ''}
    </div>`
}
