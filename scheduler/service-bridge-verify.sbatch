#!/usr/bin/env bash
#SBATCH --job-name=service-bridge-v19
#SBATCH --nodes=1
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=2
#SBATCH --mem=4G
#SBATCH --time=00:30:00
#SBATCH --output=logs/service-bridge-%j.out
#SBATCH --error=logs/service-bridge-%j.err

set -euo pipefail

ROOT_DIR="${SERVICE_BRIDGE_ROOT:-$SLURM_SUBMIT_DIR}"
cd "$ROOT_DIR"
mkdir -p logs artifacts

bash scheduler/service-bridge-verify.sh
