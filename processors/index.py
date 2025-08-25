import os
import sys
import importlib.util
import json
from pathlib import Path

def run_step(step_name):
    """
    Dynamically import and run a processing step
    """
    try:
        # Construct the path to the step file
        step_file = f"processors/{step_name}.py"
        
        if not os.path.exists(step_file):
            print(f"Step file {step_file} not found. Skipping...")
            return False
        
        print(f"\n{'='*50}")
        print(f"Running {step_name}...")
        print(f"{'='*50}")
        
        # Import and run the step
        spec = importlib.util.spec_from_file_location(step_name, step_file)
        step_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(step_module)
        
        # Call the run function for the step
        run_function_name = f'run_{step_name.lower()}'
        if hasattr(step_module, run_function_name):
            run_function = getattr(step_module, run_function_name)
            success = run_function()
            if success:
                print(f"✅ {step_name} completed successfully")
                return True
            else:
                print(f"❌ {step_name} failed")
                return False
        else:
            print(f"⚠️  No run function found for {step_name}")
            return False
        
    except Exception as e:
        print(f"❌ Error running {step_name}: {str(e)}")
        return False

def collect_step_counts():
    """
    Collect counts from Steps 5-8 by running them and capturing their output
    """
    print(f"\n{'='*50}")
    print("📊 Collecting counts from Steps 5-8...")
    print(f"{'='*50}")
    
    step_counts = {}
    
    # Define the counting steps and their expected output patterns
    counting_steps = [
        ("Step5", "blue X shapes", "Final count: "),
        ("Step6", "red squares", "Total squares detected: "),
        ("Step7", "pink shapes", "Final count: "),
        ("Step8", "green rectangles", "Total rectangles detected: ")
    ]
    
    for step_name, description, count_pattern in counting_steps:
        try:
            print(f"\n🔍 Running {step_name} to count {description}...")
            
            # Import and run the step
            step_file = f"processors/{step_name}.py"
            spec = importlib.util.spec_from_file_location(step_name, step_file)
            step_module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(step_module)
            
            # Capture the output by redirecting stdout temporarily
            import io
            import contextlib
            
            # Capture stdout to get the count
            f = io.StringIO()
            with contextlib.redirect_stdout(f):
                # Run the step using the run function
                run_function_name = f'run_{step_name.lower()}'
                if hasattr(step_module, run_function_name):
                    run_function = getattr(step_module, run_function_name)
                    run_function()
                else:
                    print(f"⚠️  Could not find run function for {step_name}")
                    continue
            
            # Get the captured output
            output = f.getvalue()
            
            # Extract the count from the output
            count = None
            for line in output.split('\n'):
                if count_pattern in line:
                    # Extract the number from the line
                    try:
                        count = int(line.split(count_pattern)[1].split()[0])
                        break
                    except (IndexError, ValueError):
                        continue
            
            if count is not None:
                step_counts[f"{step_name.lower()}_{description.replace(' ', '_')}"] = count
                print(f"✅ {step_name}: {count} {description}")
            else:
                print(f"⚠️  Could not extract count from {step_name}")
                
        except Exception as e:
            print(f"❌ Error collecting count from {step_name}: {str(e)}")
    
    return step_counts

def update_data_json(step_counts):
    """
    Update data.json with the collected step counts
    """
    try:
        # Read existing data.json
        data_file = "data.json"
        if os.path.exists(data_file):
            with open(data_file, 'r') as f:
                data = json.load(f)
        else:
            data = {}
        
        # Add step results section
        data["step_results"] = step_counts
        
        # Write back to data.json
        with open(data_file, 'w') as f:
            json.dump(data, f, indent=4)
        
        print(f"✅ Updated {data_file} with step results")
        return True
        
    except Exception as e:
        print(f"❌ Error updating data.json: {str(e)}")
        return False

def check_prerequisites():
    """
    Check if required files exist before starting processing
    """
    required_files = [
        "files/original.svg",
        "utils/config.json"
    ]
    
    missing_files = []
    for file_path in required_files:
        if not os.path.exists(file_path):
            missing_files.append(file_path)
    
    if missing_files:
        print("❌ Missing required files:")
        for file_path in missing_files:
            print(f"   - {file_path}")
        return False
    
    print("✅ All required files found")
    return True

def main():
    """
    Main orchestrator function that runs all processing steps
    """
    print("🚀 Starting AI TakeOff Processing Pipeline")
    print("=" * 60)
    
    # Check prerequisites
    if not check_prerequisites():
        print("❌ Prerequisites not met. Exiting.")
        return False
    
    # Define the processing steps in order
    steps = [
        "Step1",  # Remove duplicate paths
        "Step2",  # Modify colors (lightgray and black)
        "Step3",  # Add background
        "Step4",  # Apply color coding to specific patterns
        "Step5",  # Detect blue X shapes
        "Step6",  # Detect red squares
        "Step7",  # Detect pink shapes
        "Step8",  # Detect green rectangles
    ]
    
    successful_steps = 0
    total_steps = len(steps)
    
    # Run each step in sequence
    for step in steps:
        if run_step(step):
            successful_steps += 1
        else:
            print(f"⚠️  Pipeline stopped due to failure in {step}")
            break
    
    # Summary
    print(f"\n{'='*60}")
    print("📊 Processing Summary")
    print(f"{'='*60}")
    print(f"Steps completed: {successful_steps}/{total_steps}")
    
    if successful_steps == total_steps:
        print("🎉 All steps completed successfully!")
        
        # Collect counts from Steps 5-8
        step_counts = collect_step_counts()
        
        if step_counts:
            # Update data.json with the counts
            if update_data_json(step_counts):
                print("✅ Step counts successfully stored in data.json")
            else:
                print("⚠️  Failed to store step counts in data.json")
        
        # Check if data.json was created/updated
        if os.path.exists("data.json"):
            try:
                with open("data.json", 'r') as f:
                    data = json.load(f)
                print("📄 data.json updated with processing results")
                if 'original_drawing' in data:
                    print(f"   - Original drawing URL: {data['original_drawing']}")
                if 'step_results' in data:
                    print("   - Step results:")
                    for step, count in data['step_results'].items():
                        print(f"     * {step}: {count}")
            except Exception as e:
                print(f"⚠️  Could not read data.json: {e}")
    else:
        print("⚠️  Pipeline completed with some failures")
        # Don't exit the server, just return False to indicate failure
        return False
    
    return True

if __name__ == "__main__":
    # Change to the server directory to ensure proper file paths
    server_dir = Path(__file__).parent.parent
    os.chdir(server_dir)
    
    main()