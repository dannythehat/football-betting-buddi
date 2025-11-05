# workflow.ps1 - Workflow State Management for AI-Assisted Development
# Usage:
#   .\workflow.ps1 -Status              # Show current state
#   .\workflow.ps1 -Start "2.1"         # Start task 2.1
#   .\workflow.ps1 -Complete "2.1"      # Mark task 2.1 as complete
#   .\workflow.ps1 -Next                # Show next task to work on
#   .\workflow.ps1 -Summary             # Daily summary for AI context

param(
    [switch]$Status,
    [switch]$Next,
    [switch]$Summary,
    [string]$Start,
    [string]$Complete,
    [string]$Block,
    [string]$Note
)

$workflowFile = "WORKFLOW_STATE.json"
$statusFile = "STATUS.md"

function Get-WorkflowState {
    if (Test-Path $workflowFile) {
        return Get-Content $workflowFile | ConvertFrom-Json
    }
    Write-Error "WORKFLOW_STATE.json not found!"
    exit 1
}

function Save-WorkflowState {
    param($state)
    $state.last_updated = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    $state | ConvertTo-Json -Depth 10 | Set-Content $workflowFile
    Write-Host "✅ Workflow state updated" -ForegroundColor Green
}

function Show-Status {
    $state = Get-WorkflowState
    Write-Host "`n📊 WORKFLOW STATUS" -ForegroundColor Cyan
    Write-Host "==================" -ForegroundColor Cyan
    Write-Host "Phase: $($state.current_phase)" -ForegroundColor Yellow
    Write-Host "Week: $($state.current_week) | Day: $($state.current_day)" -ForegroundColor Yellow
    Write-Host "Focus: $($state.today_focus)" -ForegroundColor Yellow
    Write-Host "Last Updated: $($state.last_updated)`n" -ForegroundColor Gray
    
    Write-Host "🎯 ACTIVE TASKS ($($state.active_tasks.Count)):" -ForegroundColor Green
    foreach ($task in $state.active_tasks) {
        $statusIcon = if ($task.status -eq "in_progress") { "🚧" } else { "📋" }
        Write-Host "  $statusIcon [$($task.id)] $($task.name) - $($task.status)" -ForegroundColor White
        Write-Host "      Time: $($task.estimated_time) | File: $($task.file_to_edit)" -ForegroundColor Gray
    }
    
    Write-Host "`n✅ COMPLETED TODAY ($($state.completed_tasks.Count)):" -ForegroundColor Green
    $today = (Get-Date).ToString("yyyy-MM-dd")
    $todayTasks = $state.completed_tasks | Where-Object { $_.completed_date -eq $today }
    foreach ($task in $todayTasks) {
        Write-Host "  ✓ [$($task.id)] $($task.name)" -ForegroundColor Green
    }
    
    if ($state.blockers.Count -gt 0) {
        Write-Host "`n🚨 BLOCKERS:" -ForegroundColor Red
        foreach ($blocker in $state.blockers) {
            Write-Host "  ⚠️  $blocker" -ForegroundColor Red
        }
    }
    
    Write-Host "`n📈 METRICS:" -ForegroundColor Cyan
    Write-Host "  Commits: $($state.metrics.total_commits)" -ForegroundColor White
    Write-Host "  Phase 1 Progress: $($state.metrics.phase_1_progress)" -ForegroundColor White
}

function Show-Next {
    $state = Get-WorkflowState
    $nextTask = $state.active_tasks | Where-Object { $_.status -eq "pending" } | Select-Object -First 1
    
    if ($nextTask) {
        Write-Host "`n🎯 NEXT TASK" -ForegroundColor Cyan
        Write-Host "============" -ForegroundColor Cyan
        Write-Host "ID: $($nextTask.id)" -ForegroundColor Yellow
        Write-Host "Name: $($nextTask.name)" -ForegroundColor Yellow
        Write-Host "Priority: $($nextTask.priority)" -ForegroundColor Yellow
        Write-Host "Estimated Time: $($nextTask.estimated_time)" -ForegroundColor Yellow
        Write-Host "File to Edit: $($nextTask.file_to_edit)`n" -ForegroundColor Yellow
        
        Write-Host "📋 ACCEPTANCE CRITERIA:" -ForegroundColor Green
        foreach ($criteria in $nextTask.acceptance_criteria) {
            Write-Host "  ☐ $criteria" -ForegroundColor White
        }
        
        if ($nextTask.test_command) {
            Write-Host "`n🧪 TEST COMMAND:" -ForegroundColor Cyan
            Write-Host "  $($nextTask.test_command)" -ForegroundColor White
        }
        
        Write-Host "`n💡 TO START THIS TASK:" -ForegroundColor Cyan
        Write-Host "  .\workflow.ps1 -Start `"$($nextTask.id)`"" -ForegroundColor White
    } else {
        Write-Host "`n✅ No pending tasks! All active tasks completed." -ForegroundColor Green
    }
}

function Show-Summary {
    $state = Get-WorkflowState
    Write-Host "`n📝 AI CONTEXT SUMMARY" -ForegroundColor Cyan
    Write-Host "=====================" -ForegroundColor Cyan
    Write-Host @"

CURRENT STATE:
- Phase: $($state.current_phase)
- Week $($state.current_week), Day $($state.current_day)
- Focus: $($state.today_focus)

COMPLETED TODAY:
"@
    $today = (Get-Date).ToString("yyyy-MM-dd")
    $todayTasks = $state.completed_tasks | Where-Object { $_.completed_date -eq $today }
    foreach ($task in $todayTasks) {
        Write-Host "  ✓ $($task.name) (commit: $($task.commit))"
    }
    
    Write-Host "`nACTIVE TASKS:"
    foreach ($task in $state.active_tasks) {
        Write-Host "  - [$($task.id)] $($task.name) [$($task.status)]"
    }
    
    Write-Host "`nNEXT UP:"
    foreach ($task in $state.next_tasks | Select-Object -First 3) {
        Write-Host "  - [$($task.id)] $($task.name) (Day $($task.scheduled_day))"
    }
    
    if ($state.notes) {
        Write-Host "`nNOTES: $($state.notes)"
    }
}

function Start-Task {
    param($taskId)
    $state = Get-WorkflowState
    $task = $state.active_tasks | Where-Object { $_.id -eq $taskId }
    
    if ($task) {
        $task.status = "in_progress"
        $task.started_date = (Get-Date).ToString("yyyy-MM-dd")
        Save-WorkflowState $state
        
        Write-Host "`n🚀 STARTED TASK: $($task.name)" -ForegroundColor Green
        Write-Host "File to edit: $($task.file_to_edit)" -ForegroundColor Yellow
        Write-Host "`nOpening file in VS Code..." -ForegroundColor Gray
        
        if ($task.file_to_edit) {
            code $task.file_to_edit
        }
    } else {
        Write-Error "Task $taskId not found in active tasks!"
    }
}

function Complete-Task {
    param($taskId)
    $state = Get-WorkflowState
    $taskIndex = $state.active_tasks.id.IndexOf($taskId)
    
    if ($taskIndex -ge 0) {
        $task = $state.active_tasks[$taskIndex]
        $task.completed_date = (Get-Date).ToString("yyyy-MM-dd")
        $task.status = "completed"
        
        # Move to completed tasks
        $state.completed_tasks += $task
        $state.active_tasks = $state.active_tasks | Where-Object { $_.id -ne $taskId }
        
        # Update metrics
        $state.metrics.total_commits++
        
        Save-WorkflowState $state
        
        Write-Host "`n✅ COMPLETED TASK: $($task.name)" -ForegroundColor Green
        Write-Host "`n💡 NEXT STEPS:" -ForegroundColor Cyan
        Write-Host "1. Commit your changes:" -ForegroundColor White
        Write-Host "   git add ." -ForegroundColor Gray
        Write-Host "   git commit -m `"$($task.commit_message)`"" -ForegroundColor Gray
        Write-Host "   git push" -ForegroundColor Gray
        Write-Host "`n2. View next task:" -ForegroundColor White
        Write-Host "   .\workflow.ps1 -Next" -ForegroundColor Gray
    } else {
        Write-Error "Task $taskId not found in active tasks!"
    }
}

# Main execution
if ($Status) {
    Show-Status
} elseif ($Next) {
    Show-Next
} elseif ($Summary) {
    Show-Summary
} elseif ($Start) {
    Start-Task $Start
} elseif ($Complete) {
    Complete-Task $Complete
} else {
    Write-Host "`n⚽ FootballBettingBuddi - Workflow Manager" -ForegroundColor Cyan
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host "`nUsage:" -ForegroundColor Yellow
    Write-Host "  .\workflow.ps1 -Status              Show current workflow state"
    Write-Host "  .\workflow.ps1 -Next                Show next task to work on"
    Write-Host "  .\workflow.ps1 -Summary             Daily summary for AI context"
    Write-Host "  .\workflow.ps1 -Start `"2.1`"         Start task 2.1"
    Write-Host "  .\workflow.ps1 -Complete `"2.1`"      Mark task 2.1 as complete"
    Write-Host "`nExamples:" -ForegroundColor Yellow
    Write-Host "  .\workflow.ps1 -Next                # See what to work on"
    Write-Host "  .\workflow.ps1 -Start `"2.1`"         # Start backend status endpoint"
    Write-Host "  .\workflow.ps1 -Complete `"2.1`"      # Mark it done"
    Write-Host ""
}
