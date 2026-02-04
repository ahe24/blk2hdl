# Block2HDL - Visual Block Diagram to Verilog HDL Converter

A web-based visual editor for creating digital logic circuits and automatically generating Verilog HDL code.

## Features

- Visual drag-and-drop circuit design
- Real-time Verilog code generation
- Support for logic gates (AND, OR, NOT, NAND, NOR, XOR, XNOR)
- Flip-flops, multiplexers, and arithmetic operators
- Auto-routing for clean wire connections
- Dark/Light mode support
- Save/Load circuit diagrams

## Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/ahe24/blk2hdl.git
cd blk2hdl
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional, defaults to port 3000):
```bash
cp .env.example .env
# Edit .env to set your desired PORT
```

4. Run development server:
```bash
npm run dev
```

5. Open browser to `http://localhost:3000` (or your configured PORT)

## Production Deployment

### On Rocky Linux 9 / RHEL / CentOS

1. **Install Node.js:**
```bash
sudo dnf module install nodejs:18
```

2. **Clone and setup:**
```bash
git clone https://github.com/ahe24/blk2hdl.git
cd blk2hdl
npm install
```

3. **Configure port (optional):**
```bash
cat > .env << EOF
HOST=0.0.0.0
PORT=6000
EOF
```

4. **Build the application:**
```bash
npm run build
```
⚠️ **Important:** You MUST run `npm run build` before starting the production server!

5. **Start with PM2:**
```bash
# Install PM2 globally if not already installed
npm install -g pm2

# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the instructions shown by the command above
```

6. **Verify it's running:**
```bash
pm2 status
pm2 logs block2hdl
```

7. **Access the application:**
Open your browser to `http://your-server-ip:6000` (or your configured PORT)

### Troubleshooting

**If PM2 keeps restarting:**
- Make sure you ran `npm run build` first
- Check logs: `pm2 logs block2hdl --lines 100`
- Verify `.env` file exists and has valid PORT/HOST values

**Port already in use:**
- Change PORT in `.env` file
- Restart: `pm2 restart block2hdl`

**Build errors:**
- Delete node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Make sure you have Node.js 18 or higher: `node --version`

## PM2 Commands

```bash
# View status
pm2 status

# View logs
pm2 logs block2hdl

# Restart
pm2 restart block2hdl

# Stop
pm2 stop block2hdl

# Delete from PM2
pm2 delete block2hdl
```

## Environment Variables

- `HOST` - Server host (default: 0.0.0.0)
- `PORT` - Server port (default: 3000)

## Technology Stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **Diagram Editor:** ReactFlow
- **State Management:** Zustand
- **Styling:** CSS Variables with Dark/Light mode
- **Process Manager:** PM2 (production)

## License

MIT

## Author

Changseon Jo (cs.jo@ednc.com)
