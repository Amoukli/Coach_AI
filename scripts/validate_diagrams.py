#!/usr/bin/env python3
"""
Validate documentation diagrams for Coach AI Clinical Training Platform.

This script checks that all diagrams in docs/diagrams/ are:
1. Valid Mermaid syntax
2. Have current metadata (Last Updated)
3. Reference current technologies (no deprecated terms)
4. Follow naming conventions

Usage:
    python scripts/validate_diagrams.py
"""

import re
import sys
from datetime import datetime
from pathlib import Path


class DiagramValidator:
    """Validates documentation diagrams"""

    def __init__(self, diagrams_dir: Path):
        self.diagrams_dir = diagrams_dir
        self.errors = []
        self.warnings = []

    def validate_all(self) -> bool:
        """Validate all diagram files"""
        print("🔍 Validating documentation diagrams...")

        diagram_files = [f for f in self.diagrams_dir.glob("*.md") if f.name != "README.md"]

        if not diagram_files:
            self.errors.append("No diagram files found in docs/diagrams/")
            return False

        for diagram_file in diagram_files:
            self.validate_file(diagram_file)

        # Print results
        if self.errors:
            print("\n❌ Validation Errors:")
            for error in self.errors:
                print(f"  • {error}")

        if self.warnings:
            print("\n⚠️  Warnings:")
            for warning in self.warnings:
                print(f"  • {warning}")

        if not self.errors and not self.warnings:
            print("✅ All diagrams validated successfully!")
            return True

        return len(self.errors) == 0

    def validate_file(self, file_path: Path):
        """Validate a single diagram file"""
        content = file_path.read_text()

        # Check 1: Has Last Updated metadata
        self.check_metadata(file_path, content)

        # Check 2: No deprecated terms
        self.check_deprecated_terms(file_path, content)

        # Check 3: Valid Mermaid syntax
        self.check_mermaid_syntax(file_path, content)

        # Check 4: Consistent model names
        self.check_model_names(file_path, content)

        # Check 5: Coach AI specific checks
        self.check_coach_specific(file_path, content)

    def check_metadata(self, file_path: Path, content: str):
        """Check that file has Last Updated metadata"""
        last_updated_pattern = r"\*\*Last Updated\*\*: (\d{4}-\d{2}-\d{2})"
        match = re.search(last_updated_pattern, content)

        if not match:
            self.errors.append(f"{file_path.name}: Missing 'Last Updated' metadata")
            return

        # Check if date is recent (within 90 days)
        date_str = match.group(1)
        try:
            last_updated = datetime.strptime(date_str, "%Y-%m-%d")
            days_old = (datetime.now() - last_updated).days

            if days_old > 90:
                self.warnings.append(
                    f"{file_path.name}: Last updated {days_old} days ago "
                    f"({date_str}). Consider reviewing for accuracy."
                )
        except ValueError:
            self.errors.append(f"{file_path.name}: Invalid date format: {date_str}")

    def check_deprecated_terms(self, file_path: Path, content: str):
        """Check for deprecated terminology"""
        deprecated_terms = {
            "GPT-4.1-mini": "Use 'gpt-4o' or 'gpt-4o-mini'",
            "legacy parsing": "Use 'structured outputs'",
            "Azure AD B2C": "Verify if still applicable or use 'Microsoft Entra'",
        }

        for old_term, replacement in deprecated_terms.items():
            if old_term.lower() in content.lower():
                self.warnings.append(
                    f"{file_path.name}: Found potentially deprecated term '{old_term}'. "
                    f"Consider: {replacement}"
                )

    def check_mermaid_syntax(self, file_path: Path, content: str):
        """Basic Mermaid syntax validation"""
        # Find all code blocks that should be Mermaid diagrams
        mermaid_blocks = re.findall(r"```mermaid\n(.*?)```", content, re.DOTALL)

        if not mermaid_blocks:
            self.warnings.append(
                f"{file_path.name}: No Mermaid diagrams found. "
                f"Is this file structured correctly?"
            )
            return

        for i, block in enumerate(mermaid_blocks, 1):
            # Check for common syntax errors
            if not block.strip():
                self.errors.append(f"{file_path.name}: Mermaid block {i} is empty")
                continue

            # Check that diagram has a type declaration
            valid_types = [
                "graph",
                "flowchart",
                "sequenceDiagram",
                "gantt",
                "pie",
                "mindmap",
                "quadrantChart",
                "timeline",
                "stateDiagram",
                "classDiagram",
                "erDiagram",
            ]

            if not any(block.strip().startswith(t) for t in valid_types):
                self.warnings.append(
                    f"{file_path.name}: Mermaid block {i} might be missing "
                    f"diagram type declaration"
                )

    def check_model_names(self, file_path: Path, content: str):
        """Check for consistent AI model naming"""
        # Coach AI uses Azure OpenAI with gpt-4o
        incorrect_patterns = {
            r"GPT-4\.1-mini": "Use 'gpt-4o-mini' (correct version)",
            r"gpt-4\.1-mini": "Use 'gpt-4o-mini' (correct version)",
            r"GPT-4o": "Use 'gpt-4o' (lowercase)",
            r"GPT-4O": "Use 'gpt-4o' (lowercase)",
        }

        for pattern, suggestion in incorrect_patterns.items():
            if re.search(pattern, content):
                self.errors.append(f"{file_path.name}: Incorrect model name format. {suggestion}")

    def check_coach_specific(self, file_path: Path, content: str):
        """Check Coach AI specific terminology and components"""
        # Check for typos in service names
        service_typos = {
            "Senario": "Scenario",
            "Assesment": "Assessment",
            "Foundary": "Foundry",
        }

        for typo, correct in service_typos.items():
            if typo in content:
                self.errors.append(f"{file_path.name}: Typo found '{typo}'. Should be '{correct}'")

        # Check for common skill name typos only
        skill_typos = {
            "Histroy Taking": "History Taking",
            "Clincal Reasoning": "Clinical Reasoning",
            "Managment": "Management",
            "Comunication": "Communication",
            "Efficency": "Efficiency",
        }

        for typo, correct in skill_typos.items():
            if typo in content:
                self.errors.append(f"{file_path.name}: Typo found '{typo}'. Should be '{correct}'")


def main():
    """Main validation entry point"""
    project_root = Path(__file__).parent.parent
    diagrams_dir = project_root / "docs" / "diagrams"

    if not diagrams_dir.exists():
        print(f"❌ Diagrams directory not found: {diagrams_dir}")
        return 1

    validator = DiagramValidator(diagrams_dir)
    success = validator.validate_all()

    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
