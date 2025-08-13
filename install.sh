#!/bin/bash

# Claude Code JSONL Editor - Installation Script
# Usage: curl -fsSL https://raw.githubusercontent.com/anthropics/claude-code-jsonl-editor/main/install.sh | bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/anthropics/claude-code-jsonl-editor"
ARCHIVE_URL="https://github.com/anthropics/claude-code-jsonl-editor/archive/refs/heads/main.tar.gz"
INSTALL_DIR="$HOME/.claude-code-jsonl-editor"
BIN_DIR="$HOME/.local/bin"
VERSION_FILE="$INSTALL_DIR/.version"

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

check_command() {
    if command -v "$1" >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

check_system_requirements() {
    log_step "Checking system requirements..."
    
    # Check for curl
    if ! check_command curl; then
        log_error "curl is required but not installed. Please install curl first."
        exit 1
    fi
    log_success "curl is available"
    
    # Check for tar
    if ! check_command tar; then
        log_error "tar is required but not installed. Please install tar first."
        exit 1
    fi
    log_success "tar is available"
    
    # Check Node.js
    if ! check_command node; then
        log_error "Node.js is required but not installed."
        log_info "Please install Node.js (v18+ recommended): https://nodejs.org/"
        exit 1
    fi
    
    local node_version=$(node --version | sed 's/v//')
    local major_version=$(echo $node_version | cut -d. -f1)
    if [ "$major_version" -lt 16 ]; then
        log_warning "Node.js v16+ is recommended. Current version: v$node_version"
    else
        log_success "Node.js v$node_version is available"
    fi
    
    # Check npm
    if ! check_command npm; then
        log_error "npm is required but not installed. Please install npm first."
        exit 1
    fi
    log_success "npm $(npm --version) is available"
}

detect_existing_installation() {
    if [ -d "$INSTALL_DIR" ]; then
        if [ -f "$VERSION_FILE" ]; then
            local current_version=$(cat "$VERSION_FILE" 2>/dev/null || echo "unknown")
            log_info "Found existing installation (version: $current_version)"
            return 0
        else
            log_info "Found existing installation (version: unknown)"
            return 0
        fi
    fi
    return 1
}

backup_existing_config() {
    if [ -d "$INSTALL_DIR" ]; then
        local backup_dir="$INSTALL_DIR.backup.$(date +%s)"
        log_info "Creating backup at: $backup_dir"
        cp -r "$INSTALL_DIR" "$backup_dir"
        log_success "Backup created successfully"
    fi
}

download_and_extract() {
    log_step "Downloading Claude Code JSONL Editor..."
    
    local temp_dir=$(mktemp -d)
    local archive_file="$temp_dir/claude-code-jsonl-editor.tar.gz"
    
    # Download the archive
    if curl -fsSL "$ARCHIVE_URL" -o "$archive_file"; then
        log_success "Download completed"
    else
        log_error "Failed to download from $ARCHIVE_URL"
        exit 1
    fi
    
    # Create install directory
    mkdir -p "$INSTALL_DIR"
    
    # Extract archive
    log_info "Extracting files..."
    if tar -xzf "$archive_file" -C "$temp_dir"; then
        # Move files from extracted directory to install directory
        local extracted_dir="$temp_dir/claude-code-jsonl-editor-main"
        if [ -d "$extracted_dir" ]; then
            cp -r "$extracted_dir"/* "$INSTALL_DIR/"
            log_success "Files extracted successfully"
        else
            log_error "Unexpected archive structure"
            exit 1
        fi
    else
        log_error "Failed to extract archive"
        exit 1
    fi
    
    # Cleanup
    rm -rf "$temp_dir"
}

install_dependencies() {
    log_step "Installing dependencies..."
    
    cd "$INSTALL_DIR"
    
    # Install npm dependencies
    if npm install --production; then
        log_success "Dependencies installed successfully"
    else
        log_error "Failed to install dependencies"
        exit 1
    fi
}

setup_binary_link() {
    log_step "Setting up binary link..."
    
    # Create bin directory if it doesn't exist
    mkdir -p "$BIN_DIR"
    
    # Create executable script
    local bin_script="$BIN_DIR/jsonl-editor"
    cat > "$bin_script" << EOF
#!/bin/bash
cd "$INSTALL_DIR"
exec node start.js "\$@"
EOF
    
    chmod +x "$bin_script"
    log_success "Binary link created at: $bin_script"
    
    # Check if ~/.local/bin is in PATH
    if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
        log_warning "~/.local/bin is not in your PATH"
        log_info "Add this line to your ~/.bashrc or ~/.zshrc:"
        echo -e "${CYAN}export PATH=\"\$HOME/.local/bin:\$PATH\"${NC}"
        log_info "Then reload your shell: source ~/.bashrc"
    fi
}

setup_samples() {
    log_step "Setting up sample files..."
    
    if [ ! -f "$INSTALL_DIR/samples/sample.jsonl" ]; then
        log_warning "No sample files found in installation"
    else
        log_success "Sample files are available"
    fi
}

save_version() {
    # Try to get version from package.json
    local version="1.0.0"
    if [ -f "$INSTALL_DIR/package.json" ]; then
        if check_command jq; then
            version=$(jq -r '.version' "$INSTALL_DIR/package.json" 2>/dev/null || echo "1.0.0")
        elif check_command node; then
            version=$(node -p "require('$INSTALL_DIR/package.json').version" 2>/dev/null || echo "1.0.0")
        fi
    fi
    
    echo "$version" > "$VERSION_FILE"
    log_success "Version $version recorded"
}

print_usage_info() {
    echo -e "\n${GREEN}🎉 Claude Code JSONL Editor installed successfully!${NC}\n"
    
    echo -e "${CYAN}Usage:${NC}"
    echo "  jsonl-editor                    # Start with default samples"
    echo "  jsonl-editor -p ./file.jsonl    # Edit specific file"
    echo "  jsonl-editor -p ./directory     # Edit directory of files"
    echo "  jsonl-editor --help            # Show all options"
    
    echo -e "\n${CYAN}Examples:${NC}"
    echo "  jsonl-editor --expose           # Expose to network"
    echo "  jsonl-editor -p ./data -v       # Verbose logging"
    echo "  jsonl-editor --port 4000        # Custom port"
    
    echo -e "\n${CYAN}Web Interface:${NC}"
    echo "  After starting, open: http://localhost:5173"
    
    echo -e "\n${CYAN}Documentation:${NC}"
    echo "  GitHub: $REPO_URL"
    echo "  Installed at: $INSTALL_DIR"
    
    if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
        echo -e "\n${YELLOW}⚠ Note: Please add ~/.local/bin to your PATH to use 'jsonl-editor' command globally${NC}"
    fi
}

show_uninstall_info() {
    echo -e "\n${CYAN}To uninstall:${NC}"
    echo "  rm -rf $INSTALL_DIR"
    echo "  rm -f $BIN_DIR/jsonl-editor"
}

# Main installation process
main() {
    echo -e "${CYAN}📝 Claude Code JSONL Editor - Installer${NC}"
    echo -e "${CYAN}======================================${NC}\n"
    
    # Check if this is an upgrade
    local is_upgrade=false
    if detect_existing_installation; then
        is_upgrade=true
        echo -e "${YELLOW}This will upgrade your existing installation.${NC}"
        read -p "Continue? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Installation cancelled"
            exit 0
        fi
        backup_existing_config
    fi
    
    # Run installation steps
    check_system_requirements
    download_and_extract
    install_dependencies
    setup_binary_link
    setup_samples
    save_version
    
    # Show results
    if [ "$is_upgrade" = true ]; then
        log_success "Upgrade completed successfully!"
    else
        log_success "Installation completed successfully!"
    fi
    
    print_usage_info
    show_uninstall_info
}

# Handle Ctrl+C
trap 'echo -e "\n${RED}Installation cancelled${NC}"; exit 1' INT

# Run main function
main "$@"