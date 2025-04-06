# DIY Cursor - Local-Only Offline IDE

A Cursor-like IDE built to work completely offline using local LLMs.

## Features

- 📝 Modern code editor with syntax highlighting and auto-completion
- 🤖 Local LLM integration for AI assistance
- 💾 Local file system for managing code files
- 🖥️ Built-in terminal emulator
- 🧩 Resizable panels for customizable layout

## Built With

- Next.js and React
- TypeScript
- Monaco Editor for code editing
- LLama-node for local LLM integration
- TailwindCSS for styling

## Getting Started

### Prerequisites

- Node.js 18+
- A local LLM (like Llama-3, Mistral, etc.) - not included in this repo

### Installation

1. Clone the repository

   ```
   git clone https://github.com/brgv-code/diy-cursor.git
   cd diy-cursor
   ```

2. Install dependencies

   ```
   npm install
   ```

3. Start the development server

   ```
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Using Local Models

1. Download a compatible LLM to your local machine
2. In the DIY Cursor interface, click "Load Model" and enter the path to your model file
3. Once loaded, you can use the AI Assistant panel for code help and completion

## Future Improvements

- Integration with more local models (Ollama, etc.)
- File system integration with the host system
- Advanced code completion
- Git integration
- Extensions/plugins support

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
