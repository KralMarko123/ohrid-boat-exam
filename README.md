# ohrid-boat-exam

> An interactive site to practice for the boat exam in Ohrid.

I wanted to turn a pretty dull Word document full of boat exam questions into something easier to practice with. I myself am taking the exam and realized that looking at a Word file all day long literally burnt my eyes. Also, for some reason the country does have a dummy quiz you can take before taking the car exam, but not the same treatment for a boat.

You can browse the 315 questions across five topics, search for a specific term, or download the original document. There are also two quiz modes:

- **Exam:** answer 30 random questions, then see your score and review your answers.
- **Practice:** check each answer as you go.

The passing score is 70% (21 out of 30). Refreshing the page resets the current quiz.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed in the terminal.

## Test and build

```sh
npm test
npm run build
npm run preview
```

The build goes into `dist/`, ready for static hosting.

## GitHub Pages

The workflow in `.github/workflows/deploy.yml` tests and publishes the site whenever changes are pushed to `main`. It can also be run manually from the Actions tab.

In the repository settings, choose **Pages → Source → GitHub Actions**. The site will be available at [kralmarko123.github.io/ohrid-boat-exam](https://kralmarko123.github.io/ohrid-boat-exam/).

## About the questions

The questions, images, and marked answers come from the original Word document. I've kept the content as written, with minor cleanup to numbering and labels.

The question bank lives in `src/data/questions.json`. To import an updated document and check the mapping, use Python and the following scripts:

```sh
python scripts/import_document.py "path/to/document.docx"
python scripts/verify_source_mapping.py
npm test
```

The importer is tailored to this document's layout, including its highlighted answers and image choices. If the document changes, review `import-report.json` and update the expected counts in the tests.
