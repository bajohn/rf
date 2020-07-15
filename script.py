
class MyNumbers:
    

    def __iter__(self):
        self.a = 1
        return self

    def __next__(self):
        x = self.a
        self.a += 1
        return x

def fileyield():
    file = open('test.txt')
    lines = iter(file.readlines())
    yield next(lines)
    yield next(lines)
    print('doing some stuff')
    yield next(lines)
    print('doing some stuff')
    print('even more')
    yield next(lines)



def main():
    y = (x for x in fileyield())
    itery = iter(y)
    for i in range(3):
        print(next(itery))

    print(type(range(3)))


if __name__ == "__main__":
    main()

       