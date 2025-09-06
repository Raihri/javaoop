class Animal {
    int legs = 4;
    String sound = "roar"; // default sound

    Animal() {
        System.out.println("lives");
    }
}

class Human extends Animal {
    int legs = 2;
    String sound = "crying";
}

public class demo {
    public static void main(String[] args) {
        Animal a1 = new Animal();   // constructor prints "lives"
        System.out.println(a1.legs);   // prints 4
        System.out.println(a1.sound);  // prints roar

        Human h1 = new Human();
        System.out.println(h1.legs);   // prints 2 (overridden field)
        System.out.println(h1.sound);  // prints crying
    }
}
