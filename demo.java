class BasicStringExample {
    public static void main(String[] args) {
        // Create a string
        String str = "Hello World";

        // Print the string
        System.out.println("Original String: " + str);

        // Find length of the string
        System.out.println("Length: " + str.length());

        // Convert to uppercase and lowercase
        System.out.println("Uppercase: " + str.toUpperCase());
        System.out.println("Lowercase: " + str.toLowerCase());

        // Get a character at a specific position
        System.out.println("Character at index 4: " + str.charAt(4));

        // Substring example
        System.out.println("Substring (0,5): " + str.substring(0, 5));

        // Check if string contains a word
        System.out.println("Contains 'World'? " + str.contains("World"));

        // String concatenation
        String str2 = " - Java Programming";
        System.out.println("Concatenated: " + str + str2);
    }
}
