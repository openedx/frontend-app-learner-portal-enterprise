================================
Enroll Button Card Generator
================================
The below plant uml describes how we generate the enrollment button cards.

Also checkout https://miro.com/app/board/uXjVOSN-ZDY=/

PlantUML
::
  @startuml
  !pragma useVerticalIf on

  title
  Enroll Button Card Generator
  end title

  start

  if (Is course archived?) then (true)
    :<img:https://user-images.githubusercontent.com/6687387/153158555-59656415-5fdb-481a-b112-8ebad5653670.png{scale=0.4}>;
    kill
  (flase) elseif(is course enrollable?) then (false)
    if(Is availability: \n"Upcoming"or "Starting Soon"?) then (true)
      :<img:https://user-images.githubusercontent.com/6687387/153437973-a740c6ac-5375-483b-913c-009b7baedeb4.png{scale=0.4}>;
      kill
    else (false)
      :<img:https://user-images.githubusercontent.com/6687387/153158310-91615480-7285-4877-911a-4e9c9c33c4c6.png{scale=0.4}>;
      kill
    endif

  (true) elseif(Is user enrolled?) then (false)
    if (Is user entitled for course?) then (true)
      :<img:https://user-images.githubusercontent.com/6687387/153605078-ed1266c6-6783-4627-a119-578b8c9a504f.png{scale=0.4}>;      
      kill
    (false) elseif (Is course self paced?) then (true)
        if(The course stasted\nand have time to complete?) then (true)
          :<img:https://user-images.githubusercontent.com/6687387/153158358-1f70f755-d504-48cf-99b9-5f22f9819191.png{scale=0.4}>;
          kill
        else (false)
          :<img:https://user-images.githubusercontent.com/6687387/153158356-1b03470c-4753-4602-b010-5344bb672d6a.png{scale=0.4}>;
          kill
        endif
    (false) elseif (Course started?) then (true)
        :<img:https://user-images.githubusercontent.com/6687387/153158353-db1c383f-2090-451d-9af8-fcbbb7e3a797.png{scale=0.4}>;
        kill
    else (false)
        :<img:https://user-images.githubusercontent.com/6687387/153158358-1f70f755-d504-48cf-99b9-5f22f9819191.png{scale=0.4}>;
        kill
    endif
  (true)elseif (Course started?) then (true)
    :<img:https://user-images.githubusercontent.com/6687387/153610298-3804004d-d48f-4be0-a4dc-2cfd62a3b583.png{scale=0.4}>;
    kill
  else(false)
    :<img:https://user-images.githubusercontent.com/6687387/153610332-cc577aa6-945e-4113-bd76-59eaaf62d89e.png{scale=0.4}>;
    kill
  endif
  @enduml

|enroll_button_card_generator|

.. |enroll_button_card_generator| image:: enroll_button_card_generator.png
