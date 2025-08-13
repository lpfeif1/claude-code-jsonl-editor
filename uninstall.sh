#!/bin/bash

# Claude Code JSONL Editor - Uninstallation Script
# Usage: bash uninstall.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
INSTALL_DIR="$HOME/.claude-code-jsonl-editor"
BIN_DIR="$HOME/.local/bin"
BIN_FILE="$BIN_DIR/jsonl-editor"

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

check_installation() {
    if [ ! -d "$INSTALL_DIR" ] && [ ! -f "$BIN_FILE" ]; then
        log_warning "Claude Code JSONL Editor is not installed"
        exit 0
    fi
}

create_backup() {
    if [ -d "$INSTALL_DIR" ]; then
        log_step "Creating backup before uninstallation..."
        local backup_dir="$INSTALL_DIR.backup.uninstall.$(date +%s)"
        cp -r "$INSTALL_DIR" "$backup_dir"
        log_success "Backup created at: $backup_dir"
        echo -e "${YELLOW}You can restore your data from this backup if needed${NC}"
    fi
}

remove_files() {
    log_step "Removing installation files..."
    
    # Remove installation directory
    if [ -d "$INSTALL_DIR" ]; then
        rm -rf "$INSTALL_DIR"
        log_success "Removed installation directory: $INSTALL_DIR"
    fi
    
    # Remove binary link
    if [ -f "$BIN_FILE" ]; then
        rm -f "$BIN_FILE"
        log_success "Removed binary: $BIN_FILE"
    fi
}

show_cleanup_info() {
    echo -e "\n${CYAN}Additional cleanup (optional):${NC}"
    
    # Check for backup directories
    local backup_count=$(ls -d "$HOME"/.claude-code-jsonl-editor.backup.* 2>/dev/null | wc -l || echo 0)
    if [ "$backup_count" -gt 0 ]; then
        echo "  • Remove backup directories:"
        echo "    rm -rf ~/.claude-code-jsonl-editor.backup.*"
    fi
    
    # Check for Node.js cache (if no other Node projects)
    if [ -d "$HOME/.npm" ]; then
        echo "  • Clear npm cache (if not using other Node.js projects):"
        echo "    npm cache clean --force"
    fi
    
    echo -e "\n${CYAN}PATH cleanup:${NC}"
    echo "  If you added ~/.local/bin to your PATH only for this tool,"
    echo "  you may want to remove it from your shell configuration files."
}

# Main uninstallation process
main() {
    echo -e "${CYAN}📝 Claude Code JSONL Editor - Uninstaller${NC}"
    echo -e "${CYAN}=========================================${NC}\n"
    
    check_installation
    
    echo -e "${YELLOW}This will completely remove Claude Code JSONL Editor from your system.${NC}"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Uninstallation cancelled"
        exit 0
    fi
    
    # Ask about backup
    echo
    read -p "Create a backup of your data before uninstalling? (Y/n): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        log_warning "Skipping backup creation"
    else
        create_backup
    fi
    
    # Remove files
    remove_files
    
    log_success "Claude Code JSONL Editor has been successfully uninstalled!"
    show_cleanup_info
    
    echo -e "\n${GREEN}Thank you for using Claude Code JSONL Editor!${NC}"
    echo -e "${CYAN}Feedback and issues: https://github.com/anthropics/claude-code-jsonl-editor/issues${NC}"
}

# Handle Ctrl+C
trap 'echo -e "\n${RED}Uninstallation cancelled${NC}"; exit 1' INT

# Run main function
main "$@"