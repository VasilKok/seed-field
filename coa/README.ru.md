# Command-Option-Argument
[![build status](https://secure.travis-ci.org/veged/coa.png)](http://travis-ci.org/veged/coa)

## Что это?

COA — парсер параметров командной строки, позволяющий извлечь максимум пользы от формального API вашей программы.
Как только вы опишете определение в терминах команд, параметров и аргументов, вы автоматически получите:

* Справку для командной строки
* API для использования программы как модуля в COA-совместимых программах
* Автодополнение для командной строки

### Прочие возможности

* Широкий выбор настроек для параметров и аргументов, включая множественные значения, логические значения и обязательность параметров
* Возможность асинхронного исполнения команд, используя промисы (используется библиотека [Q](https://github.com/kriskowal/q))
* Простота использования существующих команд как подмодулей для новых команд
* Комбинированная валидация и анализ сложных значений

## Примеры

````javascript
require('coa').Cmd() // декларация команды верхнего уровня
    .name(process.argv[1]) // имя команды верхнего уровня, берем из имени программы
    .title('Жутко полезная утилита для командной строки') // название для использования в справке и сообщениях
    .helpful() // добавляем поддержку справки командной строки (-h, --help)
    .opt() // добавляем параметр
        .name('version') // имя параметра для использования в API
        .title('Version') // текст для вывода в сообщениях
        .short('v') // короткое имя параметра: -v
        .long('version') // длинное имя параметра: --version
        .flag() // параметр не требует ввода значения
        .act(function(opts) {  // действия при вызове аргумента
            // результатом является вывод текстового сообщения
            return JSON.parse(require('fs').readFileSync(__dirname + '/package.json'))
                .version;
        })
        .end() // завершаем определение параметра и возвращаемся к определению верхнего уровня
    .cmd().name('subcommand').apply(require('./subcommand').COA).end() // загрузка подкоманды из модуля
    .cmd() // добавляем еще одну подкоманду
        .name('othercommand').title('Еще одна полезная подпрограмма').helpful()
        .opt()
            .name('input').title('input file, required')
            .short('i').long('input')
            .val(function(v) { // функция-валидатор, также может использоваться для трансформации значений параметров
                return require('fs').createReadStream(v) })
            .req() // параметр является обязательным
            .end() // завершаем определение параметра и возвращаемся к определению команды
        .end() // завершаем определение подкоманды и возвращаемся к определению команды верхнего уровня
    .run(process.argv.slice(2)); // разбираем process.argv и запускаем
````

````javascript
// subcommand.js
exports.COA = function() {
    this
        .title('Полезная подпрограмма').helpful()
        .opt()
            .name('output').title('output file')
            .short('o').long('output')
            .output() // использовать стандартную настройку для параметра вывода
            .end()
};
````

## API

### Cmd
Команда — сущность верхнего уровня. У команды могут быть определены параметры и аргументы.

#### Cmd.api
Возвращает объект, который можно использовать в других программах. Подкоманды являются методами этого объекта.<br>
**@returns** *{Object}*

#### Cmd.name
Определяет канонический идентификатор команды, используемый в вызовах API.<br>
**@param** *String* `_name` имя команды<br>
**@returns** *COA.Cmd* `this` экземпляр команды (для поддержки цепочки методов)

#### Cmd.title
Определяет название команды, используемый в текстовых сообщениях.<br>
**@param** *String* `_title` название команды<br>
**@returns** *COA.Cmd* `this` экземпляр команды (для поддержки цепочки методов)

#### Cmd.cmd
Создает новую подкоманду или добавляет ранее определенную подкоманду к текущей команде.<br>
**@param** *COA.Cmd* `[cmd]` экземпляр ранее определенной подкоманды<br>
**@returns** *COA.Cmd* экземпляр новой или ранее определенной подкоманды

#### Cmd.opt
Создает параметр для текущей команды.<br>
**@returns** *COA.Opt* `new` экземпляр параметра

#### Cmd.arg
Создает аргумент для текущей команды.<br>
**@returns** *COA.Opt* `new` экземпляр аргумента

#### Cmd.act
Добавляет (или создает) действие для текущей команды.<br>
**@param** *Function* `act` функция,
    выполняемая в контексте экземпляра текущей команды
    и принимающая следующие параметры:<br>
        - *Object* `opts` параметры команды<br>
        - *Array* `args` аргументы команды<br>
        - *Object* `res` объект-аккумулятор результатов<br>
    Функция может вернуть проваленный промис из Cmd.reject (в случае ошибки)
    или любое другое значение, рассматриваемое как результат.<br>
**@param** *{Boolean}* [force=false] флаг, назначающий немедленное исполнение вместо добавления к списку существующих действий<br>
**@returns** *COA.Cmd* `this` экземпляр команды (для поддержки цепочки методов)

#### Cmd.apply
Исполняет функцию с переданными аргументами в контексте экземпляра текущей команды.<br>
**@param** *Function* `fn`<br>
**@param** *Array* `args`<br>
**@returns** *COA.Cmd* `this` экземпляр команды (для поддержки цепочки методов)

#### Cmd.comp
Назначает кастомную функцию автодополнения для текущей команды.<br>
**@param** *Function* `fn` функция-генератор автодополнения,
    исполняемая в контексте текущей команды.
    Принимает параметры:<br>
        - *Object* `opts` параметры<br>
    Может возвращать промис или любое другое значение, рассматриваемое как результат исполнения команды.<br>
**@returns** *COA.Cmd* `this` экземпляр команды (для поддержки цепочки методов)

#### Cmd.helpful
Ставит флаг поддержки справки командной строки, т.е. вызов команды с параметрами -h --help выводит справку по работе с командой.<br>
**@returns** *COA.Cmd* `this` экземпляр команды (для поддержки цепочки методов)

#### Cmd.completable
Добавляет поддержку автодополнения командной строки. Добавляется подкоманда "completion", которая выполняет все необходимые действия.<br>
Может быть добавлен только для главной команды.<br>
**@returns** *COA.Cmd* `this` экземпляр команды (для поддержки цепочки методов)

#### Cmd.usage
Возвращает текст справки по использованию команды для текущего экземпляра.<br>
**@returns** *String* `usage` Текст справки по использованию

#### Cmd.run
Разбирает аргументы из значения, возвращаемого NodeJS process.argv,
и запускает текущую программу, т.е. вызывает process.exit после завершения
всех действий.<br>
**@param** *Array* `argv`<br>
**@returns** *COA.Cmd* `this` экземпляр команды (для поддержки цепочки методов)

#### Cmd.invoke
Исполняет переданную (или текущую) команду с указанными параметрами и аргументами.<br>
**@param** *String|Array* `cmds`  подкоманда для исполнения (необязательно)<br>
**@param** *Object* `opts`  параметры, передаваемые команде (необязательно)<br>
**@param** *Object* `args`  аргументы, передаваемые команде (необязательно)<br>
**@returns** *Q.Promise*

#### Cmd.reject
Проваливает промисы, возращенные в действиях.<br>
Используется в .act() для возврата с ошибкой.<br>
**@param** *Object* `reason` причина провала<br>
    Вы можете определить метод toString() и свойство toString()
    объекта причины провала.<br>
**@returns** *Q.promise* проваленный промис

#### Cmd.end
Завершает цепочку методов текущей подкоманды и возвращает экземпляр родительской команды.<br>
**@returns** *COA.Cmd* `parent` родительская команда

### Opt
Параметр — именованная сущность. У параметра может быть определено короткое или длинное имя для использования из командной строки.<br>
**@namespace**<br>
**@class** Переданный параметр

#### Opt.name
Определяет канонический идентификатор параметра, используемый в вызовах API.<br>
**@param** *String* `_name` имя параметра<br>
**@returns** *COA.Opt* `this` экземпляр параметра (для поддержки цепочки методов)

#### Opt.title
Определяет описание для параметра, используемое в текстовых сообщениях.<br>
**@param** *String* `_title` название параметра<br>
**@returns** *COA.Opt* `this` экземпляр параметра (для поддержки цепочки методов)

#### Opt.short
Назначает ключ для короткого имени параметра, передаваемого из командной строки с одинарным дефисом (например, `-v`).<br>
**@param** *String* `_short`<br>
**@returns** *COA.Opt* `this` экземпляр параметра (для поддержки цепочки методов)

#### Opt.long
Назначает ключ для длинного имени параметра, передаваемого из командной строки с двойным дефисом (например, `--version`).<br>
**@param** *String* `_long`<br>
**@returns** *COA.Opt* `this` экземпляр параметра (для поддержки цепочки методов)

#### Opt.flag
Помечает параметр как логический, т.е. параметр не имеющий значения.<br>
**@returns** *COA.Opt* `this` экземпляр параметра (для поддержки цепочки методов)

#### Opt.arr
Помечает параметр как принимающий множественные значения.<br>
Иначе будет использовано последнее переданное значение параметра.<br>
**@returns** *COA.Opt* `this` экземпляр параметра (для поддержки цепочки методов)

#### Opt.req
Помечает параметр как обязательный.<br>
**@returns** *COA.Opt* `this` экземпляр параметра (для поддержки цепочки методов)

#### Opt.only
Интерпретирует параметр как команду,
т.е. программа будет завершена сразу после выполнения параметра.<br>
**@returns** *COA.Opt* `this` экземпляр параметра (для поддержки цепочки методов)

#### Opt.val
Назначает функцию валидации (или трансформации значения) для значения параметра.<br>
Значение, полученное из командной строки, передается в функцию-валидатор прежде чем оно станет доступно из API.<br>
Используется для валидации и трансформации введенных данных.<br>
**@param** *Function* `_val` функция валидации,
    исполняемая в контексте экземпляра параметра
    и принимающая в качестве единственного параметра значение, полученное
    из командной строки<br>
**@returns** *COA.Opt* `this` экземпляр параметра (для поддержки цепочки методов)

#### Opt.def
Назначает значение параметра по умолчанию. Это значение также передается
в функцию валидации как обычное значение.<br>
**@param** *Object* `_def`<br>
**@returns** *COA.Opt* `this` экземпляр параметра (для поддержки цепочки методов)

#### Opt.input
Помечает параметр как принимающий ввод пользователя. <br>
Позволяет использовать валидацию для STDIN.<br>
**@returns** *{COA.Opt}* `this` экземпляр параметра (для поддержки цепочки методов)

#### Opt.output
Помечает параметр как вывод.<br>
Позволяет использовать валидацию для STDOUT.<br>
**@returns** *COA.Opt* `this` экземпляр параметра (для поддержки цепочки методов)

#### Opt.act
Добавляет (или создает) действие для текущего параметра команды.
Это действие будет выполнено, если текущий параметр есть
в списке полученных параметров (с любым значением).<br>
**@param** *Function* `act` функция, выполняемая в контексте
    экземпляра текущей команды и принимающая следующие параметры:<br>
        - *Object* `opts` параметры команды<br>
        - *Array* `args` аргументы команды<br>
        - *Object* `res` объект-аккумулятор результатов<br>
    Функция может вернуть проваленный промис из Cmd.reject (в случае ошибки)
    или любое другое значение, рассматриваемое как результат.<br>
**@returns** *COA.Opt* `this` экземпляр параметра (для поддержки цепочки методов)

#### Opt.comp
Назначает кастомную функцию автодополнения для текущей команды.<br>
**@param** *Function* `fn` функция-генератор автодоплнения, исполняемая в
    контексте экземпляра команды.
    Принимает параметры:<br>
        - *Object* `opts` параметры автодополнения<br>
    Может возвращать промис или любое другое значение, рассматриваемое как результат исполнения команды.<br>
**@returns** *COA.Opt* `this` экземпляр параметра (для поддержки цепочки методов)

#### Opt.end
Завершает цепочку методов текущего параметра и возвращает экземпляр родительской команды.<br>
**@returns** *COA.Cmd* `parent` родительская команда


### Arg
Аргумент — неименованная сущность.<br>
Аргументы передаются из командной строки как список неименованных значений.

#### Arg.name
Определяет канонический идентификатор аргумента, используемый в вызовах API.<br>
**@param** *String* `_name` имя аргумента<br>
**@returns** *COA.Arg* `this` экземпляр аргумента (для поддержки цепочки методов)

#### Arg.title
Определяет описание для аргумента, используемое в текстовых сообщениях.<br>
**@param** *String* `_title` описание аргумента<br>
**@returns** *COA.Arg* `this` экземпляр аргумента (для поддержки цепочки методов)

#### Arg.arr
Помечает аргумент как принимающий множественные значения.<br>
Иначе будет использовано последнее переданное значение аргумента.<br>
**@returns** *COA.Arg* `this` экземпляр аргумента (для поддержки цепочки методов)

#### Arg.req
Помечает аргумент как обязательный.<br>
**@returns** *COA.Arg* `this` экземпляр аргумента (для поддержки цепочки методов)

#### Arg.val
Назначает функцию валидации (или трансформации значения) для аргумента.<br>
Значение, полученное из командной строки, передается в функцию-валидатор прежде чем оно станет доступно из API.<br>
Используется для валидации и трансформации введенных данных.<br>
**@param** *Function* `_val` функция валидации,
    исполняемая в контексте экземпляра аргумента
    и принимающая в качестве единственного параметра значение, полученное
    из командной строки<br>
**@returns** *COA.Opt* `this` экземпляр аргумента (для поддержки цепочки методов)

#### Arg.def
Назначает дефолтное значение для аргумента. Дефолтное значение передается
в функцию валидации как обычное значение.<br>
**@param** *Object* `_def`<br>
**@returns** *COA.Arg* `this` экземпляр аргумента (для поддержки цепочки методов)

#### Arg.output
Помечает параметр как вывод.<br>
Позволяет назначить валидацию для STDOUT.<br>
**@returns** *COA.Arg* `this` экземпляр аргумента (для поддержки цепочки методов)

#### Arg.comp
Назначает кастомную функцию автодополнения для текущего аргумента.<br>
**@param** *Function* `fn` функция-генератор автодоплнения,
    исполняемая в контексте текущей команды.
    Принимает параметры:<br>
        - *Object* `opts` параметры
Может возвращать промис или любое другое значение, рассматриваемое как результат исполнения команды.<br>
**@returns** *COA.Arg* `this` экземпляр аргумента (для поддержки цепочки методов)

#### Arg.end
Завершает цепочку методов текущего аргумента и возвращает экземпляр родительской команды.<br>
**@returns** *COA.Cmd* `parent` родительская команда
