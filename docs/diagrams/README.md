# Coach AI Architecture Diagrams

This directory contains Mermaid diagrams documenting the Coach AI Clinical Training Platform architecture.

## Diagram Index

| Diagram | Description |
|---------|-------------|
| [architecture.md](architecture.md) | High-level system architecture |
| [data-flow.md](data-flow.md) | Data flow through the application |
| [scenario-engine.md](scenario-engine.md) | Scenario and dialogue tree processing |
| [assessment-flow.md](assessment-flow.md) | Assessment scoring and feedback flow |

## Standards

All diagrams in this directory must:

1. **Use Mermaid syntax** - GitHub renders Mermaid natively
2. **Include metadata** - Last Updated date at the top
3. **Be validated** - Run `python scripts/validate_diagrams.py` before committing
4. **Stay current** - Update when architecture changes

## Validation

Diagrams are automatically validated on commit via pre-commit hooks. To manually validate:

```bash
python scripts/validate_diagrams.py
```

## Contributing

When adding or updating diagrams:

1. Follow existing naming conventions
2. Include clear labels and descriptions
3. Update the Last Updated date
4. Run validation before committing
5. Reference actual file paths where relevant
