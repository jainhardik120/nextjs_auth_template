import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const AboutSection: React.FC = () => {
  return (
    <section id="about" className=" min-h-screen container mx-auto px-12 flex">
      <div className="flex flex-col my-auto gap-12 mx-auto">
        <h2 className="text-center text-4xl font-bold">About Me</h2>
        <div className="max-w-3xl mx-auto w-full">
          <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue="item-1"
          >
            <AccordionItem value="item-1">
              <AccordionTrigger>Education</AccordionTrigger>
              <AccordionContent>
                <p>
                  I am currently pursuing a Bachelor&apos;s degree in{" "}
                  <span className="font-semibold text-indigo-600">
                    Computer Science
                  </span>{" "}
                  at{" "}
                  <span className="font-semibold text-indigo-600">
                    Jaypee Institute of Information Technology
                  </span>
                  , where I have maintained a GPA of{" "}
                  <span className="font-semibold text-indigo-600">9.1</span>.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Knowledge</AccordionTrigger>
              <AccordionContent>
                <ul className="list-none">
                  <li>Data Structures and Algorithms (DSA)</li>
                  <li>Object-Oriented Programming (OOP)</li>
                  <li>Computer Networks</li>
                  <li>Database Management Systems (DBMS)</li>
                  <li>Operating Systems (OS)</li>
                  <li>Other core Computer Science subjects</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Development Experience</AccordionTrigger>
              <AccordionContent>
                <p>
                  I am an experienced Android and web developer with several
                  published applications that have been downloaded thousands of
                  times.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Achievements</AccordionTrigger>
              <AccordionContent>
                <p>
                  I have solved over{" "}
                  <span className="font-semibold text-indigo-600">
                    500 problems
                  </span>{" "}
                  on LeetCode, showcasing my strong problem-solving abilities.
                </p>
                <p>
                  My android application{" "}
                  <span className="font-semibold text-indigo-600">
                    JIIT Buddy
                  </span>{" "}
                  has reached a total of{" "}
                  <span className="font-semibold text-indigo-600">5000+</span>{" "}
                  downloads on Play Store.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
