def choose_from_list(prompt, options):
    print(f"\n{prompt}")
    for i, option in enumerate(options, 1):
        print(f"{i}. {option}")
    
    while True:
        try:
            choice = int(input("Enter the number of your choice: "))
            if 1 <= choice <= len(options):
                return options[choice - 1]
            else:
                print("Invalid choice. Try again.")
        except ValueError:
            print("Please enter a valid number.")

def main():
    # Hierarchical data structure
    data = {
        "District A": {
            "Municipality X": ["Settlement 1", "Settlement 2"],
            "Municipality Y": ["Settlement 3", "Settlement 4"]
        },
        "District B": {
            "Municipality Z": ["Settlement 5", "Settlement 6"],
            "Municipality W": ["Settlement 7"]
        }
    }

    # Step 1: Choose district
    districts = list(data.keys())
    district = choose_from_list("Choose a district:", districts)

    # Step 2: Choose municipality (filtered by district)
    municipalities = list(data[district].keys())
    municipality = choose_from_list("Choose a municipality:", municipalities)

    # Step 3: Choose settlement (filtered by municipality)
    settlements = data[district][municipality]
    settlement = choose_from_list("Choose a settlement:", settlements)

    # Final combined string
    combined_string = f"{district} - {municipality} - {settlement}"
    print("\nYour combined string is:")
    print(combined_string)

if __name__ == "__main__":
    main()
