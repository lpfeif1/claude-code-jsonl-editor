#!/bin/bash

# Test script for local installation testing
# This simulates the GitHub download process using local files

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration for testing
INSTALL_DIR="$HOME/.claude-code-jsonl-editor-test"
BIN_DIR="$HOME/.local/bin"
VERSION_FILE="$INSTALL_DIR/.version"
CURRENT_DIR=$(pwd)

# Functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

log_step() {
    echo -e "\n${CYAN}📝 $1${NC}"
}

# Main test installation process
main() {
    echo -e "${CYAN}📝 Claude Code JSONL Editor - Local Test Installer${NC}"
    echo -e "${CYAN}=================================================${NC}\n"
    
    log_warning "This is a TEST installation using local files"
    log_info "Install directory: $INSTALL_DIR"
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -f "start.js" ]; then
        log_error "Please run this script from the claude-code-jsonl-editor directory"
        exit 1
    fi
    
    # Clean up any existing test installation
    if [ -d "$INSTALL_DIR" ]; then
        log_step "Cleaning up previous test installation..."
        rm -rf "$INSTALL_DIR"
    fi
    
    # Create install directory and copy files
    log_step "Copying local files to test installation directory..."
    mkdir -p "$INSTALL_DIR"
    
    # Copy all files except node_modules and .git
    rsync -av --exclude 'node_modules' --exclude '.git' --exclude '*.log' "$CURRENT_DIR/" "$INSTALL_DIR/"
    log_success "Files copied successfully"
    
    # Install dependencies
    log_step "Installing dependencies..."
    cd "$INSTALL_DIR"
    if npm install --production; then
        log_success "Dependencies installed successfully"
    else
        log_error "Failed to install dependencies"
        exit 1
    fi
    
    # Create test binary link
    log_step "Setting up test binary link..."
    mkdir -p "$BIN_DIR"
    
    local bin_script="$BIN_DIR/jsonl-editor-test"
    cat > "$bin_script" << EOF
#!/bin/bash
cd "$INSTALL_DIR"
exec node start.js "\$@"
EOF
    
    chmod +x "$bin_script"
    log_success "Test binary link created at: $bin_script"
    
    # Save version
    local version="test-$(date +%s)"
    echo "$version" > "$VERSION_FILE"
    log_success "Test version $version recorded"
    
    # Show test results
    echo -e "\n${GREEN}🎉 Test installation completed successfully!${NC}\n"
    
    echo -e "${CYAN}Test Usage:${NC}"
    echo "  jsonl-editor-test              # Start with default samples"
    echo "  jsonl-editor-test --help       # Show all options"
    
    echo -e "\n${CYAN}Test Cleanup:${NC}"
    echo "  rm -rf $INSTALL_DIR"
    echo "  rm -f $BIN_DIR/jsonl-editor-test"
    
    echo -e "\n${YELLOW}⚠ This is a test installation. Use 'jsonl-editor-test' command.${NC}"
}

# Handle Ctrl+C
trap 'echo -e "\n${RED}Test installation cancelled${NC}"; exit 1' INT

# Run main function
main "$@"